import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function ChatBox({
  title = 'Pokój czatu',
  avatar,
  firstMessage = 'Świadek stoi przed Tobą, zacznij rozmowę detektywie!',
  helpText = "Brak podpowiedzi dla tego pokoju.",
  clueImage,
  clueTitle = "Poszlaka",
  onEnd
}) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: firstMessage }
  ]);
  const [input, setInput] = useState('');
  const [ended, setEnded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleEnd = () => {
    setEnded(true);
    setTimeout(() => {
      if (onEnd) {
        onEnd();
      } else {
        navigate('/');
      }
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
      const res = await fetch(
        `${API_BASE}/api/room/${roomId}/ask-gpt`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        }
      );
      const data = await res.json();

      setMessages(msgs => [
        ...msgs.slice(0, -1),
        { from: 'bot', text: data.answer }
      ]);
    } catch (error) {
      setMessages(msgs => [
        ...msgs.slice(0, -1),
        { from: 'bot', text: 'Błąd AI lub połączenia.' }
      ]);
    }
    setInput('');
  };

  if (ended) {
    return (
      <div className="chat-box-main"
        style={{
          justifyContent: 'center',
        }}
      >
        <h2 style={{ color: '#e05', textAlign: 'center' }}>Przesłuchanie zakończone</h2>
        <p style={{ textAlign: 'center' }}>Dziękujemy za udział! Za chwilę wrócisz do ekranu początkowego.</p>
      </div>
    );
  }

  return (
    <div className="chat-box-main">
      {/* PRZYCISKI POMOCY I GWIAZDKI */}
      <div style={{
        position: 'absolute',
        top: 18,
        right: 18,
        display: 'flex',
        gap: 10,
        zIndex: 5
      }}>
        {/* POMOC */}
        <button
          onClick={() => setShowHelp(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: '#e05',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: '0 2px 8px #111',
            cursor: 'pointer'
          }}
          aria-label="Podpowiedź"
        >?</button>
        {/* GWIAZDKA */}
        <button
          onClick={() => setShowClue(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: '#e05',
            color: '#fff700',
            fontWeight: 'bold',
            fontSize: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: '0 2px 8px #111',
            cursor: 'pointer'
          }}
          aria-label="Poszlaka"
        >
          <span className="star-icon">★</span>
        </button>
      </div>

      {/* MODALE */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: 14,
              maxWidth: 380,
              minWidth: 280,
              padding: 30,
              color: '#fff',
              boxShadow: '0 0 34px #72002699',
              position: 'relative'
            }}>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: 'absolute',
                top: 10, right: 10,
                background: 'none',
                border: 'none',
                color: '#e05',
                fontWeight: 'bold',
                fontSize: 26,
                cursor: 'pointer'
              }}
              aria-label="Zamknij"
            >&times;</button>
            <h2 style={{ marginTop: 0, marginBottom: 16, color: '#e05', textAlign: 'center', fontSize: 22 }}>Podpowiedzi</h2>
            <div style={{ fontSize: 16, lineHeight: 1.6, textAlign: 'center', whiteSpace: 'pre-line' }}>
              {helpText}
            </div>
          </div>
        </div>
      )}

      {showClue && clueImage && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100
          }}
          onClick={() => setShowClue(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: 14,
              maxWidth: 440,
              minWidth: 280,
              padding: 26,
              color: '#fff',
              boxShadow: '0 0 44px #fff70080',
              position: 'relative',
              textAlign: 'center'
            }}>
            <button
              onClick={() => setShowClue(false)}
              style={{
                position: 'absolute',
                top: 10, right: 10,
                background: 'none',
                border: 'none',
                color: '#fff700',
                fontWeight: 'bold',
                fontSize: 26,
                cursor: 'pointer'
              }}
              aria-label="Zamknij"
            >&times;</button>
            <h2 style={{ marginTop: 0, marginBottom: 20, color: '#fff700', fontWeight: 700 }}>{clueTitle}</h2>
            <img src={clueImage} alt="Poszlaka" style={{
              maxWidth: 320, maxHeight: 220, borderRadius: 10, boxShadow: '0 0 16px #fff70088', marginBottom: 6
            }} />
          </div>
        </div>
      )}

      {/* AVATAR */}
      {avatar && (
        <img
          src={avatar}
          alt="Avatar"
          style={{
            width: 90,
            height: 90,
            objectFit: 'cover',
            borderRadius: '50%',
            marginBottom: 12,
            boxShadow: '0 0 16px #72002677'
          }}
        />
      )}

      <h2 style={{ textAlign: 'center', color: '#e05', margin: 0, marginBottom: 6 }}>{title}</h2>
      <div
        ref={chatBodyRef}
        className="chat-messages"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === 'user' ? 'right' : 'left',
              margin: '10px 0'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 14px',
                background: msg.from === 'user' ? '#720026' : '#2a000a',
                borderRadius: 18,
                color: '#fff',
                maxWidth: '70%',
                wordBreak: 'break-word'
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      
      {/* Przycisk i pole na dole */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Napisz wiadomość..."
        />
        <button type="submit">Wyślij</button>
      </form>

      <button
        onClick={handleEnd}
        style={{
          marginTop: 12,
          background: '#720026',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 28px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #111'
        }}
      >
        Zakończ Przesłuchanie
      </button>
    </div>
  );
}

export default ChatBox;
