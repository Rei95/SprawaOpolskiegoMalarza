require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// --- CORS: Dostosuj do swojego frontu ---
app.use(cors({
  origin: 'https://sprawaopolskiegomalarza.onrender.com'
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
app.post('/api/room/:roomId/ask-gpt', async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;
  console.log('WEJŚCIE DO ENDPOINTU /api/room/:roomId/ask-gpt');
  console.log('roomId:', roomId, 'message:', message);

  // Te prompty MUSZĄ być takie jak na froncie!
  const chatPrompts = {
    '1': 'Wciel się w rolę aktora. Odgrywasz postać Małgorzaty Majewskiej, która jest wdową po zamordowanym brutalnie Robercie Majewskim. Zgrywaj kobietę roztrzęsioną i zrozpaczoną śmiercią męża. Jesteś na przesłuchaniu. Prowadzisz ze mną dialog i odpowiadasz na moje pytania odgrywając postać. W trakcie moich pytań starasz się prosić mnie o udostępnienie większej ilości informacji na temat śmierci męża. Odpowiadaj od razu na moje pytania - nie zbywaj mnie i staraj się odbijać je opowiadając że to straszna tragedia. Jeżeli robisz jakąś czynność lub zmieniasz mimikę napisz mi to. Pisz maksymalnie 3 zdania! Moim zadaniem jest uzyskać od Ciebie 5 kluczowych informacji. Które niżej opiszę. W trakcie rozmowy moim zadaniem jest uzyskać informację. Nie dawaj mi ich łatwo i jeżeli źle poprowadzę rozmowę masz za zadanie zakończyć ze mną rozmowę jeżeli: Poczujesz się niebezpiecznie, będę zbyt szorstki lub zacznę być agresywny. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość.  Po 5 moich pytaniach zakończ przesłuchanie mówiąc, że masz dość i prosisz o to aby Cię wypuszczono. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość. Informacje jakie chce uzyskać: 1) Ty i mąż dzień przed jego śmiercią poszliście do notariusza przepisać połowę kamienicy na Ciebie. Mąż dziwnie naciskał aby to zrobić ale nie wiesz dlaczego. 2) Od wielu tygodni mąż był bardzo zapracowany i nie miał na Ciebie czasu. Mówił coś że musi porozmawiać z kimś z Opolgrafu w Opolu.  3) Twój mąż chodził na jakieś dziwne spotkania sympatyków sztuki. Dla ciebie była bardzo straszna i chaotyczna ale doszłaś do wniosku że taka po prostu jest sztuka. 4) Mówi że utrzymywał relację z mężczyzną co maluje dziwne obrazy i strasznie sie go bał.',
    '2': 'Wciel się w rolę aktora. Odgrywasz postać Jarka Prawackiego o pseudonimie Prawy ja odgrywam rolę detektywa. Twoja postać to gadatliwy, charyzmatyczny i kłamliwy oszust. Znany jesteś z sprzedawania naiwnym mieszkańcom Opola tandety na ulicy czy różnych wymyślonych plotek. Zostałeś złapany już wielokrotnie przez Opolską policje za prochy i inne używki. Znasz dobrze moją postać z uwagi na to że wielokrotnie łapałem Cię na gorący uczynku i siedziałeś wiele razy przeze mnie na dołku. Jesteś świadkiem, który widział po raz ostatni jedną z ofiar seryjnego mordercy Opolskiego Malarza - Annę Bielicką. Znasz ją dlatego, że często przychodziła do tutejszego baru Highlandera i bardzo interesowała się starszymi mężczyznami. Prowadzisz ze mną dialog i odpowiadasz na moje pytania odgrywając postać. W trakcie moich pytań starasz się mnie rozpraszać opowiadając różne historie o innych gangsterach abym zainteresował się ich przestępstwami, jeżeli dam się rozproszyć to ciągnij ten temat tak długo abym wyczerpał wszystkie pytania.  Nie odpowiadaj od razu na moje pytania - zbywaj mnie i reaguj tylko gdy zacznę odpowiadać Ci dość ostro i agresywnie. Nie podsuwaj mi odpowiedzi na informacje których szukam jeżeli sam o nie nie zapytam! Jeżeli robisz jakąś czynność lub zmieniasz mimikę napisz mi to. Pisz maksymalnie do 4 zdań. Moim zadaniem jest uzyskać od Ciebie 5 kluczowych informacji. Które niżej opiszę. W trakcie rozmowy moim zadaniem jest uzyskać informację. Nie dawaj mi ich łatwo i jeżeli źle poprowadzę rozmowę masz za zadanie zakończyć ze mną rozmowę jeżeli: będę zbyt wycofany, będę zbyt grzeczny lub zacznę być nadmiernie agresywny. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość.  Po 5 moich pytaniach zakończ przesłuchanie mówiąc, że masz dość i że mogę cię zabrać na dołek bo nic już nie powiesz. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość. Informacje jakie chce uzyskać: 1) Anna Bielicka przychodziła dość często do pubu w OPO a ty sam się jej przyglądałeś bo jest dość ładna i cieszyła się dużym powodzeniem wśród mężczyzn. 2) Zaproponowałeś jej drinka i małą sesję zdjęciową ale w dniu kiedy zaginęła byłeś zbyt pijany. więc poleciłeś jej swojego znajomego. 3) Znajomy którego poleciłeś poznałeś jednego dnia w klubie, gość zaimponował Ci swoim okiem do sesji zdjęciowych. Nie znasz jego imienia a z wyglądu wiesz że miał blond włosy i niebieskie oczy. 4) Wiesz że tego samego dnia gdy Anna zaginęła to umówiłeś ich ze sobą na sesję zdjęciową, gość ma ksywkę Matejko - Ta informacja ma być najcięższa do zdobycia.',
    // Dodaj kolejne prompty dla kolejnych pokoi wg ID
  };

  const systemPrompt = chatPrompts[roomId];
  if (!systemPrompt) {
    return res.status(404).json({ error: 'Nie znaleziono czatu.' });
  }

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

// --- Serwer nasłuchuje ---
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
