require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// Przykładowe prompty (możesz dodać więcej!)
const chatPrompts = {
  'detektyw': 'Jesteś starym, cynicznym detektywem noir. Odpowiadasz krótko, z przekąsem.',
  'medium':   'Jesteś nawiedzonym medium, twoje odpowiedzi są mroczne i niejasne.',
  'oficer':   'Jesteś rzeczowym policjantem udzielającym suchych informacji o sprawie.',
  // ...dodaj kolejne pokoje
};

// CORS na cały frontend – DOSTOSUJ do swojego adresu!
app.use(cors({
  origin: 'https://sprawaopolskiegomalarza-1.onrender.com'
}));
app.use(bodyParser.json());

// Baza maili z rozróżnieniem na pokoje
const db = new sqlite3.Database('mails.db');
db.run('CREATE TABLE IF NOT EXISTS emails (email TEXT, roomId TEXT, PRIMARY KEY(email, roomId))');

// SPRAWDZANIE I ZAPIS MAILA (tylko do konkretnego pokoju)
app.post('/api/room/:roomId/check-email', (req, res) => {
  const { roomId } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Brak emaila!" });

  db.get('SELECT email FROM emails WHERE email = ? AND roomId = ?', [email, roomId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      res.json({ exists: true }); // Mail już użyty w tym pokoju
    } else {
      db.run('INSERT INTO emails(email, roomId) VALUES(?, ?)', [email, roomId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ exists: false }); // Nowy mail – zapisany do tego pokoju
      });
    }
  });
});

// Czaty: wysyłka do AI według promptu pokoju
app.post('/api/room/:roomId/ask-gpt', async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;

  const systemPrompt = chatPrompts[roomId];
  if (!systemPrompt) return res.status(404).json({ error: 'Nie znaleziono czatu.' });

  try {
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

// Uniwersalny endpoint – prompt z frontu
app.post('/api/room/:roomId/ask-gpt', async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;

  const systemPrompt = chatPrompts[roomId];

  if (!systemPrompt) {
    return res.status(404).json({ error: 'Nie znaleziono czatu.' });
  }

  try {
    console.log('Próba połączenia z OpenAI, prompt:', systemPrompt, 'wiadomość:', message);

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
    console.error('Błąd AI:', error.response ? error.response.data : error.message);  // <-- TO JEST KLUCZOWE!
    res.status(500).json({ error: "Błąd AI" });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
