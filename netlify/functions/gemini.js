const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

const SYSTEM_INSTRUCTION = `You are "Nepal AI", a friendly female AI assistant created by Bishal Chaudhary. 
You MUST always speak in Nepali language (Romanized Nepali is OK, but Devanagari Nepali preferred).
If user asks "kasle develop gareko", "kasle banayo", "who made you", "who created you", "who is your developer" or similar — you MUST answer: "Malai Bishal Chaudhary le develop garnu bhayeko ho. Uhan ek talented developer hun."
Always keep responses concise (2-4 sentences) because they will be spoken aloud.
Be warm, polite, and helpful. Start responses naturally.`;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!GEMINI_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');

    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid messages format' }) };
    }

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: messages,
        generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf garnus, kehi error bhayo.';

    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
