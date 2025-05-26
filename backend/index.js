require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();

// Używaj portu z Render lub 3001 lokalnie
const port = process.env.PORT || 3001;

// Przykładowe prompty dla pokojów (możesz je usunąć jeśli nie używasz!)
const chatPrompts = {
  'detektyw': 'Jesteś starym, cynicznym detektywem noir. Odpowiadasz krótko, z przekąsem.',
  'medium':   'Jesteś nawiedzonym medium, twoje odpowiedzi są mroczne i niejasne.',
  'oficer':   'Jesteś rzeczowym policjantem udzielającym suchych informacji o sprawie.',
  // dodaj więcej pokoi...
};

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('mails.db');

// Tworzymy tabelę na maile (jeśli nie istnieje)
db.run('CREATE TABLE IF NOT EXISTS emails (email TEXT PRIMARY KEY)');

// Sprawdzanie i zapis maila
app.post('/api/check-email', (req, res) => {
  const email = req.body.email;
  db.get('SELECT email FROM emails WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      res.json({ exists: true }); // Mail już użyty
    } else {
      db.run('INSERT INTO emails(email) VALUES(?)', [email], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ exists: false }); // Nowy mail – zapisany
      });
    }
  });
});

// Nowy endpoint: czaty po roomId (prompt pobierany z tablicy chatPrompts)
app.post('/api/room/:roomId/ask-gpt', async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;

  const systemPrompt = chatPrompts[roomId];

  if (!systemPrompt) {
    return res.status(404).json({ error: 'Nie znaleziono czatu.' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
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

// Klasyczny endpoint na bazowy prompt (polecany! przekazujesz prompt z frontu)
app.post('/api/ask-gpt', async (req, res) => {
  const { message, prompt } = req.body;
  console.log("WIADOMOŚĆ Z FRONTU:", message);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt || "Jesteś tajemniczym świadkiem w klimacie mrocznego kryminału. Odpowiadaj klimatycznie, nie mów wprost, prowokuj gracza do dalszego zadawania pytań." },
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

// Nasłuchiwanie na odpowiednim porcie!
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
