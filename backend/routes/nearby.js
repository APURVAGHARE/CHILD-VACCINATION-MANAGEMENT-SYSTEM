const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const axios = require('axios');

// =============================================
// SIMPLE SEARCH - Get clinics by city/location
// =============================================
router.get('/clinics', auth, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT id, clinic_name, address, city, contact_number FROM clinics';
    const params = [];
    
    if (search) {
      query += ' WHERE city ILIKE $1 OR clinic_name ILIKE $1 OR address ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY clinic_name';
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      clinics: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// GROQ AI POWERED SEARCH
// =============================================
router.post('/ai-search', auth, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Get all clinics from database
    const clinicsResult = await db.query(
      'SELECT id, clinic_name, address, city, contact_number FROM clinics'
    );

    // Prepare clinics list for AI
    const clinicsList = clinicsResult.rows.map(c => 
      `- ${c.clinic_name}: ${c.address}, ${c.city} (📞 ${c.contact_number})`
    ).join('\n');

    // Call Groq API
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful medical assistant helping parents find vaccination clinics.
            Based on the user's query, recommend the most suitable clinics from the list below.
            Be friendly, helpful, and concise. Format your response in a readable way.
            
            Available clinics:
            ${clinicsList}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = groqResponse.data.choices[0].message.content;

    res.json({
      success: true,
      ai_response: aiResponse,
      clinics: clinicsResult.rows
    });

  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ 
      error: 'AI search failed',
      details: error.message 
    });
  }
});

module.exports = router;