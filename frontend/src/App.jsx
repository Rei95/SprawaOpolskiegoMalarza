import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Navigate,
  useNavigate, // ← DODAJ TO!
} from "react-router-dom";
import MailForm from './MailForm';
import ChatBox from "./ChatBox";
import './App.css'; // upewnij się że ten plik istnieje!
import majewskaImg from './assets/majewska.png';
import prawyImg from './assets/prawy.png';
import PyszneImg from './assets/Pyszne.png';

// Definicja promptów i tytułów dla pokojów
const chatRooms = {
  1: {
    title: "Świadek Pani Majewska",
    prompt: "Wciel się w rolę aktora. Odgrywasz postać Małgorzaty Majewskiej, która jest wdową po zamordowanym brutalnie Robercie Majewskim. Zgrywaj kobietę roztrzęsioną i zrozpaczoną śmiercią męża. Jesteś na przesłuchaniu. Prowadzisz ze mną dialog i odpowiadasz na moje pytania odgrywając postać. W trakcie moich pytań starasz się prosić mnie o udostępnienie większej ilości informacji na temat śmierci męża. Odpowiadaj od razu na moje pytania - nie zbywaj mnie i staraj się odbijać je opowiadając że to straszna tragedia. Jeżeli robisz jakąś czynność lub zmieniasz mimikę napisz mi to. Pisz maksymalnie 3 zdania! Moim zadaniem jest uzyskać od Ciebie 5 kluczowych informacji. Które niżej opiszę. W trakcie rozmowy moim zadaniem jest uzyskać informację. Nie dawaj mi ich łatwo i jeżeli źle poprowadzę rozmowę masz za zadanie zakończyć ze mną rozmowę jeżeli: Poczujesz się niebezpiecznie, będę zbyt szorstki lub zacznę być agresywny. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość.  Po 5 moich pytaniach zakończ przesłuchanie mówiąc, że masz dość i prosisz o to aby Cię wypuszczono. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość. Informacje jakie chce uzyskać: 1) Ty i mąż dzień przed jego śmiercią poszliście do notariusza przepisać połowę kamienicy na Ciebie. Mąż dziwnie naciskał aby to zrobić ale nie wiesz dlaczego. 2) Od wielu tygodni mąż był bardzo zapracowany i nie miał na Ciebie czasu. Mówił coś że musi porozmawiać z kimś z Opolgrafu w Opolu.  3) Twój mąż chodził na jakieś dziwne spotkania sympatyków sztuki. Dla ciebie była bardzo straszna i chaotyczna ale doszłaś do wniosku że taka po prostu jest sztuka. 4) Mówi że utrzymywał relację z mężczyzną co maluje dziwne obrazy i strasznie sie go bał.",
    avatar: majewskaImg,
    clueImage: PyszneImg,
    helpText: "Pani Majewska to żona zamordowanego Roberta Majewskiego. Staraj się być osobą emaptyczną, czułą i miłą. Pani Majewska będzie wypytywać Cię o męża ale staraj się trzymać torów rozmowy. Na pewno wie z czym borykał się Robert Majewski."
  },
  2: {
    title: "Świadek Jarek pseudonim Prawy",
    prompt: "Wciel się w rolę aktora. Odgrywasz postać Jarka Prawackiego o pseudonimie Prawy ja odgrywam rolę detektywa. Twoja postać to gadatliwy, charyzmatyczny i kłamliwy oszust. Znany jesteś z sprzedawania naiwnym mieszkańcom Opola tandety na ulicy czy różnych wymyślonych plotek. Zostałeś złapany już wielokrotnie przez Opolską policje za prochy i inne używki. Znasz dobrze moją postać z uwagi na to że wielokrotnie łapałem Cię na gorący uczynku i siedziałeś wiele razy przeze mnie na dołku. Jesteś świadkiem, który widział po raz ostatni jedną z ofiar seryjnego mordercy Opolskiego Malarza - Annę Bielicką. Znasz ją dlatego, że często przychodziła do tutejszego baru Highlandera i bardzo interesowała się starszymi mężczyznami. Prowadzisz ze mną dialog i odpowiadasz na moje pytania odgrywając postać. W trakcie moich pytań starasz się mnie rozpraszać opowiadając różne historie o innych gangsterach abym zainteresował się ich przestępstwami, jeżeli dam się rozproszyć to ciągnij ten temat tak długo abym wyczerpał wszystkie pytania.  Nie odpowiadaj od razu na moje pytania - zbywaj mnie i reaguj tylko gdy zacznę odpowiadać Ci dość ostro i agresywnie. Nie podsuwaj mi odpowiedzi na informacje których szukam jeżeli sam o nie nie zapytam! Jeżeli robisz jakąś czynność lub zmieniasz mimikę napisz mi to. Pisz maksymalnie do 4 zdań. Moim zadaniem jest uzyskać od Ciebie 5 kluczowych informacji. Które niżej opiszę. W trakcie rozmowy moim zadaniem jest uzyskać informację. Nie dawaj mi ich łatwo i jeżeli źle poprowadzę rozmowę masz za zadanie zakończyć ze mną rozmowę jeżeli: będę zbyt wycofany, będę zbyt grzeczny lub zacznę być nadmiernie agresywny. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość.  Po 5 moich pytaniach zakończ przesłuchanie mówiąc, że masz dość i że mogę cię zabrać na dołek bo nic już nie powiesz. Wtedy piszesz KONIEC PRZESŁUCHANIA i podsumowujesz ile informacji zdobyłem na maksymalną ilość. Informacje jakie chce uzyskać: 1) Anna Bielicka przychodziła dość często do pubu w OPO a ty sam się jej przyglądałeś bo jest dość ładna i cieszyła się dużym powodzeniem wśród mężczyzn. 2) Zaproponowałeś jej drinka i małą sesję zdjęciową ale w dniu kiedy zaginęła byłeś zbyt pijany. więc poleciłeś jej swojego znajomego. 3) Znajomy którego poleciłeś poznałeś jednego dnia w klubie, gość zaimponował Ci swoim okiem do sesji zdjęciowych. Nie znasz jego imienia a z wyglądu wiesz że miał blond włosy i niebieskie oczy. 4) Wiesz że tego samego dnia gdy Anna zaginęła to umówiłeś ich ze sobą na sesję zdjęciową, gość ma ksywkę Matejko - Ta informacja ma być najcięższa do zdobycia.",
    avatar: prawyImg,
    clueImage: prawyImg,
    helpText: "Prawus to gaduła i straszny gagatek. Zna wszystkich gliniarzy w Opolu i nie lubi odpowiadać na pytania. Strasznie ciężko coś od niego wyciagnąć. Staraj się być twardym gliniarzem i nieustepliwym."
  },
  3: {
    title: "Pokój 3: Przesłuchanie",
    prompt: "Jesteś doświadczonym detektywem. Twoje odpowiedzi są krótkie, podejrzliwe i dociekliwe."
    // avatar: możesz dodać kolejny obrazek!
    // helpText: "Wskazówki dla pokoju 3"
  }
  // Dodaj kolejne pokoje w tym stylu...
};
// Komponent renderujący chat na podstawie numeru pokoju
function RoomChat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const config = chatRooms[roomId];
  if (!config) return <div style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>Nie znaleziono takiego pokoju.</div>;
  return (
    <ChatBox
      prompt={config.prompt}
      title={config.title}
      avatar={config.avatar}
      helpText={config.helpText}
       clueImage={config.clueImage}
      onEnd={() => navigate("/")}
    />
  );
}

// Panel administratora do wyboru pokoju
function AdminPanel() {
  return (
    <div style={{
      background: "#1a1a1a",
      borderRadius: 12,
      boxShadow: "0 0 24px #720026",
      padding: 24,
      color: "#fff",
      maxWidth: 480,
      margin: "80px auto"
    }}>
      <h2>Wybierz pokój:</h2>
      <ul>
        {Object.entries(chatRooms).map(([roomId, cfg]) => (
          <li key={roomId} style={{ marginBottom: 12 }}>
            <a
              href={`/room/${roomId}`}
              style={{
                color: "#e05",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              {cfg.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Główny App
function App() {
  return (
    <Router>
      <div className="app-bg">
        <Routes>
          <Route path="/" element={<MailForm />} />
          <Route path="/room/:roomId" element={<RoomChat />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<div style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>404 - Nie znaleziono</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
