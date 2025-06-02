require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'https://sprawaopolskiegomalarza-1.onrender.com',
  credentials: true,
}));
app.use(bodyParser.json());

// --- Baza maili na pokoje ---
const db = new sqlite3.Database('mails.db');
db.run('CREATE TABLE IF NOT EXISTS emails (email TEXT, roomId TEXT, PRIMARY KEY(email, roomId))');

// --- Sprawdzanie maila na pokój ---
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

// --- GŁÓWNY ENDPOINT DO CZATU AI ---
// Prompt ładowany z pliku tekstowego z katalogu "prompts/"
app.post('/api/room/:roomId/ask-gpt', async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;
  console.log('WEJŚCIE DO ENDPOINTU /api/room/:roomId/ask-gpt');
  console.log('roomId:', roomId, 'message:', message);

  // Plik z promtem, np. prompts/1.txt
  const promptPath = path.join(__dirname, 'prompts', `${roomId}.txt`);
  let systemPrompt;
  try {
    systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  } catch (err) {
    return res.status(404).json({ error: 'Prompt dla tego pokoju nie istnieje.' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "GPT-4 Turbo",
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

// --- Serwer nasłuchuje ---
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
