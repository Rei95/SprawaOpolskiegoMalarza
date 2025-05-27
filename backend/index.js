app.post('/api/room/:roomId/ask-gpt', async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;
  console.log('WEJŚCIE DO ENDPOINTU /api/room/:roomId/ask-gpt');
  console.log('roomId:', roomId, 'message:', message);

  // Tutaj podmień na swoje prompty!
  const chatPrompts = {
    '1': 'Jesteś starym detektywem z pokoju 1.',
    '2': 'Jesteś gadatliwym oszustem z pokoju 2.',
    // ...
  };

  const systemPrompt = chatPrompts[roomId];
  if (!systemPrompt) {
    return res.status(404).json({ error: 'Nie znaleziono czatu.' });
  }

  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const answer = response.data.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error('Błąd AI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Błąd AI" });
  }
});
