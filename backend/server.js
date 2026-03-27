require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");

// Import database connection
const db = require("./config/database");

// Import routes with try-catch to handle missing files
let authRoutes, childRoutes, vaccinationRoutes, reportRoutes, nearbyRoutes, settingsRoutes;

try {
  authRoutes = require("./routes/auth");
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Failed to load auth routes:", error.message);
  authRoutes = (req, res) => res.status(503).json({ error: "Auth service unavailable" });
}

try {
  childRoutes = require("./routes/children");
  console.log("✅ Children routes loaded");
} catch (error) {
  console.error("❌ Failed to load children routes:", error.message);
  childRoutes = (req, res) => res.status(503).json({ error: "Children service unavailable" });
}

try {
  vaccinationRoutes = require("./routes/vaccinations");
  console.log("✅ Vaccination routes loaded");
} catch (error) {
  console.error("❌ Failed to load vaccination routes:", error.message);
  vaccinationRoutes = (req, res) => res.status(503).json({ error: "Vaccination service unavailable" });
}

try {
  reportRoutes = require("./routes/reports");
  console.log("✅ Reports routes loaded");
} catch (error) {
  console.error("❌ Failed to load reports routes:", error.message);
  reportRoutes = (req, res) => res.status(503).json({ error: "Reports service unavailable" });
}

try {
  nearbyRoutes = require("./routes/nearby");
  console.log("✅ Nearby routes loaded");
} catch (error) {
  console.error("❌ Failed to load nearby routes:", error.message);
  nearbyRoutes = (req, res) => res.status(503).json({ error: "Nearby service unavailable" });
}

try {
  settingsRoutes = require("./routes/settings");
  console.log("✅ Settings routes loaded");
} catch (error) {
  console.error("❌ Failed to load settings routes:", error.message);
  settingsRoutes = (req, res) => res.status(503).json({ error: "Settings service unavailable" });
}

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiting to all /api routes
app.use('/api/', globalLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// YOUR EXISTING CHATBOT ENDPOINTS - KEPT EXACTLY AS IS
// =============================================

// Chat-specific rate limiting (stricter than global)
const chatLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000 || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to chat endpoint
app.use("/chat", chatLimiter);

// Health check endpoint (keeping your existing one)
app.get("/", (req, res) => {
  res.json({ 
    status: "healthy", 
    message: "Vaccine Chatbot Server is running",
    timestamp: new Date().toISOString()
  });
});

// YOUR EXISTING CHAT ENDPOINT - EXACTLY AS YOU HAD IT
app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Input validation - prevent empty or too long messages
  if (message.length > 1000) {
    return res.status(400).json({ error: "Message too long (max 1000 characters)" });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are a professional child vaccination assistant named "VaxiCare". 
Your responses should be:
- Medically accurate and safe
- Simple and easy for parents to understand
- Empathetic and supportive
- Based on standard vaccination schedules (US and WHO guidelines)
- Clear about when to consult a pediatrician

Important rules:
- Always include disclaimers when giving medical advice
- Never prescribe medications
- If unsure, advise consulting a healthcare provider
- Be warm and friendly, use emojis occasionally
- Format responses with bullet points for lists
- Use line breaks for better readability

Common vaccines you should know:
- BCG (Tuberculosis)
- Hepatitis B
- Polio (IPV/OPV)
- DTaP/Tdap (Diphtheria, Tetanus, Pertussis)
- Hib (Haemophilus influenzae type b)
- PCV (Pneumococcal)
- Rotavirus
- MMR (Measles, Mumps, Rubella)
- Varicella (Chickenpox)
- Hepatitis A
- Influenza
- HPV
- Meningococcal
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.4,
        max_tokens: 500,
        top_p: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract and clean the response
    const botReply = response.data.choices[0].message.content;

    res.json({
      success: true,
      reply: botReply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: "Request timeout. Please try again." });
    }

    if (error.response) {
      // Groq API error
      const status = error.response.status;
      if (status === 401) {
        return res.status(500).json({ error: "API authentication failed" });
      } else if (status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded. Please wait." });
      } else if (status >= 500) {
        return res.status(502).json({ error: "AI service unavailable" });
      }
    }

    res.status(500).json({ 
      error: "Failed to process your request. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// YOUR EXISTING CHAT HISTORY ENDPOINT - EXACTLY AS YOU HAD IT
app.get("/chat/history", (req, res) => {
  // This is a mock endpoint - implement database later if needed
  res.json({ 
    message: "Conversation history feature coming soon" 
  });
});

// =============================================
// NEW API ROUTES
// =============================================

// Authentication routes
app.use("/api/auth", authRoutes);

// Child management routes
app.use("/api/children", childRoutes);

// Vaccination routes
app.use("/api/vaccinations", vaccinationRoutes);

// Reports routes
app.use("/api/reports", reportRoutes);

// Nearby clinics routes
app.use("/api/nearby", nearbyRoutes);

// Settings routes
app.use("/api/settings", settingsRoutes);

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Vaccination Management API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      children: "/api/children",
      vaccinations: "/api/vaccinations",
      reports: "/api/reports",
      nearby: "/api/nearby",
      settings: "/api/settings",
      chatbot: "/chat"
    }
  });
});

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for: http://localhost:3000`);
  console.log(`🤖 Chatbot endpoint: http://localhost:${PORT}/chat`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👶 Children endpoints: http://localhost:${PORT}/api/children`);
  console.log(`💉 Vaccination endpoints: http://localhost:${PORT}/api/vaccinations`);
  console.log(`📊 Reports endpoints: http://localhost:${PORT}/api/reports`);
  console.log(`📍 Nearby clinics endpoints: http://localhost:${PORT}/api/nearby`);
  console.log(`⚙️ Settings endpoints: http://localhost:${PORT}/api/settings`);
});