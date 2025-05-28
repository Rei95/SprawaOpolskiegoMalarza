import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
function isMobile() { return window.innerWidth < 700; }

function ChatBox({
  title = 'Pokój czatu',
  avatar,
  firstMessage = 'Świadek stoi przed Tobą, zacznij rozmowę detektywie!',
  helpText = "Brak podpowiedzi dla tego pokoju.",
  clueImage,
  clueTitle = "Poszlaka",
  onEnd
}) {
  const [messages, setMessages] = useState([{ from: 'bot', text: firstMessage }]);
  const [input, setInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll do dołu przy każdej nowej wiadomości
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Obsługa wykrywania klawiatury mobilnej
  useEffect(() => {
    if (!isMobile()) return;
    const handleFocus = () => setKeyboardOpen(true);
    const handleBlur = () => setKeyboardOpen(false);
    const inp = inputRef.current;
    if (inp) {
      inp.addEventListener('focus', handleFocus);
      inp.addEventListener('blur', handleBlur);
    }
    return () => {
      if (inp) {
        inp.removeEventListener('focus', handleFocus);
        inp.removeEventListener('blur', handleBlur);
      }
    };
  }, [inputRef]);

  const handleEnd = () => {
    setEnded(true);
    setTimeout(() => {
      if (onEnd) onEnd();
      else navigate('/');
    }, 500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [
      ...msgs,
      { from: 'user', text: input },
      { from: 'bot', text: '...' }
    ]);
    try {
      const res = await fetch(`${API_BASE}/api/room/${roomId}/ask-gpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(msgs => [
        ...msgs.slice(0, -1),
        { from: 'bot', text: data.answer }
      ]);
    } catch {
      setMessages(msgs => [
        ...msgs.slice(0, -1),
        { from: 'bot', text: 'Błąd AI lub połączenia.' }
      ]);
    }
    setInput('');
  };

  if (ended) {
    return (
      <div className="chat-box-main" style={{ justifyContent: 'center' }}>
        <h2 style={{ color: '#e05', textAlign: 'center' }}>Przesłuchanie zakończone</h2>
        <p style={{ textAlign: 'center' }}>Dziękujemy za udział! Za chwilę wrócisz do ekranu początkowego.</p>
      </div>
    );
  }

  return (
    <div className="chat-box-main">

      {/* Główna sekcja nagłówka */}
      <div className="header-row">
        {avatar && (
          <img
            src={avatar}
            alt="Avatar"
            className="header-avatar"
          />
        )}
        <div style={{ flex: 1 }}></div>
        <div className="header-buttons">
          <button
            className="header-btn"
            onClick={() => setShowHelp(true)}
            aria-label="Podpowiedź"
          >?</button>
          <button
            className="header-btn"
            style={{ background: "#e05", color: "#fff700", position: "relative" }}
            onClick={() => setShowClue(true)}
            aria-label="Poszlaka"
          >
            {/* Wyśrodkowana gwiazdka SVG */}
            <svg className="star-icon" viewBox="0 0 24 24">
              <polygon
                points="12,3 15,9.5 22,10.3 17,15.1 18.2,21.8 12,18.5 5.8,21.8 7,15.1 2,10.3 9,9.5"
                fill="#fff700"
                stroke="#fff700"
                strokeWidth="1"
                style={{ display: "block", margin: "auto" }}
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-title">{title}</div>

      <div ref={chatBodyRef} className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === 'user' ? 'right' : 'left',
              margin: '13px 0'
            }}
          >
            <span className={`chat-bubble${msg.from === 'user' ? ' user' : ''}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Przycisk "Zakończ Przesłuchanie" nad inputem */}
      <div className={`end-btn-bar ${keyboardOpen && isMobile() ? 'hide-on-keyboard' : ''}`}>
        <button onClick={handleEnd}>
          Zakończ Przesłuchanie
        </button>
      </div>

      {/* Pole do wpisywania i przycisk Wyślij */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Napisz wiadomość..."
          autoComplete="off"
        />
        <button type="submit" className="send-btn" aria-label="Wyślij">
          {/* Wyśrodkowana strzałka (SVG) */}
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 21L21 12L3 3V10L17 12L3 14V21Z" fill="currentColor" />
          </svg>
        </button>
      </form>

      {/* Modale pomocy i poszlaki */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: 14, maxWidth: 380,
              minWidth: 280, padding: 30, color: '#fff',
              boxShadow: '0 0 34px #72002699', position: 'relative'
            }}>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                color: '#e05', fontWeight: 'bold', fontSize: 26, cursor: 'pointer'
              }}
              aria-label="Zamknij"
            >&times;</button>
            <h2 style={{
              marginTop: 0, marginBottom: 16, color: '#e05',
              textAlign: 'center', fontSize: 22
            }}>Podpowiedzi</h2>
            <div style={{
              fontSize: 16, lineHeight: 1.6, textAlign: 'center', whiteSpace: 'pre-line'
            }}>
              {helpText}
            </div>
          </div>
        </div>
      )}

      {showClue && clueImage && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
          }}
          onClick={() => setShowClue(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: 14, maxWidth: 440, minWidth: 280, padding: 26,
              color: '#fff', boxShadow: '0 0 44px #fff70080', position: 'relative', textAlign: 'center'
            }}>
            <button
              onClick={() => setShowClue(false)}
              style={{
                position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                color: '#fff700', fontWeight: 'bold', fontSize: 26, cursor: 'pointer'
              }}
              aria-label="Zamknij"
            >&times;</button>
            <h2 style={{
              marginTop: 0, marginBottom: 20, color: '#fff700', fontWeight: 700
            }}>{clueTitle}</h2>
            <img src={clueImage} alt="Poszlaka" style={{
              maxWidth: 320, maxHeight: 220, borderRadius: 10,
              boxShadow: '0 0 16px #fff70088', marginBottom: 6
            }}/>
          </div>
        </div>
      )}
    </div>
  );
}
export default ChatBox;
