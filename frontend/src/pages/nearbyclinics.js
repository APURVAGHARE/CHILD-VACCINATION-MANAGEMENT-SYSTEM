import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { nearbyAPI } from '../services/api';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

const NearbyClinics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('simple'); // 'simple' or 'ai'

  const handleSimpleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setLoading(true);
    setAiResponse('');
    
    try {
      const res = await nearbyAPI.getClinics({ search: searchQuery });
      setClinics(res.data.clinics || []);
      
      if (res.data.clinics?.length === 0) {
        toast.info('No clinics found in this area');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please ask a question');
      return;
    }

    setLoading(true);
    setClinics([]);
    
    try {
      const res = await nearbyAPI.aiSearch({ query: searchQuery });
      setAiResponse(res.data.ai_response);
      setClinics(res.data.clinics || []);
      toast.success('AI response received!');
    } catch (error) {
      console.error('AI search error:', error);
      toast.error('AI search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nearby Clinics</h1>
        <p className="text-gray-600">Find vaccination centers near you</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode('simple')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'simple' 
              ? 'bg-white shadow-md text-primary-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Simple Search
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition ${
            mode === 'ai' 
              ? 'bg-white shadow-md text-purple-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <SparklesIcon className="h-4 w-4 mr-1" />
          AI Search
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mode === 'ai' 
              ? "Ask AI: e.g., 'Find me the best children's clinic in Mumbai with good reviews'" 
              : "Enter city name (e.g., Mumbai, Delhi)"}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            onKeyPress={(e) => e.key === 'Enter' && (mode === 'ai' ? handleAISearch() : handleSimpleSearch())}
          />
          <button
            onClick={mode === 'ai' ? handleAISearch : handleSimpleSearch}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {loading ? (
              'Searching...'
            ) : mode === 'ai' ? (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Ask AI
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Response */}
      {mode === 'ai' && aiResponse && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <SparklesIcon className="h-6 w-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
            <div className="prose prose-purple">
              <p className="text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {clinics.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-primary-600">{clinics.length}</span> clinics
            {searchQuery && <span> in <span className="font-medium">"{searchQuery}"</span></span>}
          </p>
        </div>
      )}

      {/* Clinics Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {clinic.clinic_name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{clinic.address}, {clinic.city}</span>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>{clinic.contact_number || 'Not available'}</span>
                </div>
              </div>

              <button className="mt-4 w-full bg-primary-50 text-primary-700 py-2 rounded-lg hover:bg-primary-100 transition text-sm font-medium">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && clinics.length === 0 && searchQuery && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
          <p className="text-gray-500">
            {mode === 'ai' 
              ? 'Try asking the AI in a different way'
              : 'Try searching for another city like Mumbai, Delhi, or Bangalore'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NearbyClinics;