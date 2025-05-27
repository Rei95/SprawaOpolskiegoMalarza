import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
      // Dynamiczny endpoint na podstawie roomId z URL
      const res = await fetch(
        `https://sprawaopolskiegomalarza-1.onrender.com/api/room/${roomId}/ask-gpt`,
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
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: 12,
          boxShadow: '0 0 24px #720026',
          padding: 24,
          maxWidth: 420,
          minHeight: 320,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <h2 style={{ color: '#e05', textAlign: 'center' }}>Przesłuchanie zakończone</h2>
        <p style={{ textAlign: 'center' }}>Dziękujemy za udział! Za chwilę wrócisz do ekranu początkowego.</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      background: '#1a1a1a',
      borderRadius: 12,
      boxShadow: '0 0 24px #720026',
      padding: 24,
      maxWidth: 420,
      minHeight: 320,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      alignItems: 'center'
    }}>
      {/* PRZYCISKI POMOCY I GWIAZDKI */}
      <div style={{ position: 'absolute', top: -25, right: -25, display: 'flex', gap: 10, zIndex: 5 }}>
        {/* POMOC */}
        <button
          onClick={() => setShowHelp(true)}
          style={{
            width: 48,
            height: 48,
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
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: '#e05',        // czerwone tło jak "?"
            color: '#fff700',           // żółta gwiazdka
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
        >★</button>
      </div>

      {/* MODAL Z PODPOWIEDZIAMI */}
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

      {/* MODAL Z POSZLAKĄ */}
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
            }}/>
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
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: 12,
        marginTop: 10,
        width: '100%'
      }}>
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
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, width: '100%' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#fff',
            color: '#111'
          }}
          placeholder="Napisz wiadomość..."
        />
        <button type="submit"
          style={{
            background: '#720026',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0 18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >Wyślij</button>
      </form>

      {/* PRZYCISK ZAKOŃCZ */}
      <button
        onClick={handleEnd}
        style={{
          marginTop: 18,
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
