import { useRef, useState, useEffect } from 'react';
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
  const [showTutorial, setShowTutorial] = useState({
    help: false,
    clue: false,
    end: false,
  });
  const navigate = useNavigate();
  const { roomId } = useParams();
  const msgListRef = useRef(null);

  // SCROLL DO DOŁU PO KAŻDEJ NOWEJ WIADOMOŚCI
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
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
    }, 600);
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

  const closeTutorial = () => setShowTutorial({ help: false, clue: false, end: false });

  if (ended) {
    return (
      <div className="chat-container" style={{justifyContent: 'center', alignItems: 'center', minHeight: '350px'}}>
        <h2 style={{ color: '#e05', textAlign: 'center', marginTop: 90 }}>Przesłuchanie zakończone</h2>
        <p style={{ textAlign: 'center' }}>Dziękujemy za udział! Za chwilę wrócisz do ekranu początkowego.</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* SAMOUCZKI */}
      {showTutorial.help && (
        <TutorialTip onClose={closeTutorial}>
          <b>Podpowiedź</b><br/>
          Tutaj znajdziesz wskazówki dotyczące rozmowy lub pokoju.<br/>
          <i>Kliknij poza okno, aby zamknąć.</i>
        </TutorialTip>
      )}
      {showTutorial.clue && (
        <TutorialTip onClose={closeTutorial}>
          <b>Poszlaka</b><br/>
          Tutaj możesz zobaczyć ważną poszlakę (np. zdjęcie, notatkę).<br/>
          <i>Kliknij poza okno, aby zamknąć.</i>
        </TutorialTip>
      )}
      {showTutorial.end && (
        <TutorialTip onClose={closeTutorial}>
          <b>Zakończ przesłuchanie</b><br/>
          Kliknij ten przycisk, by zakończyć rozmowę i wrócić do ekranu głównego.<br/>
          <i>Kliknij poza okno, aby zamknąć.</i>
        </TutorialTip>
      )}

      {/* HEADER */}
      <div className="header-area">
        <div className="avatar-row">
          {avatar && <img src={avatar} alt="Avatar" className="chat-avatar" />}
          <div className="action-btns">
            <button
              className="round-btn"
              type="button"
              aria-label="Podpowiedź"
              onClick={() => setShowTutorial({ help: true, clue: false, end: false })}
            >?</button>
            <button
              className="round-btn star"
              type="button"
              aria-label="Poszlaka"
              onClick={() => setShowTutorial({ help: false, clue: true, end: false })}
              style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg viewBox="0 0 32 32" width="22" height="22" fill="#ffe400" style={{display: "block", margin: "auto"}}>
                <polygon points="16,3 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="chat-title">{title}</div>
      </div>

      {/* MODALE */}
      {showHelp && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.65)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 99
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: 14, maxWidth: 380, minWidth: 260, padding: 30,
              color: '#fff', boxShadow: '0 0 34px #72002699', position: 'relative'
            }}>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                color: '#e05', fontWeight: 'bold', fontSize: 26, cursor: 'pointer'
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
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.75)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 100
          }}
          onClick={() => setShowClue(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: 14, maxWidth: 440, minWidth: 260, padding: 26,
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
            <h2 style={{ marginTop: 0, marginBottom: 20, color: '#fff700', fontWeight: 700 }}>{clueTitle}</h2>
            <img src={clueImage} alt="Poszlaka" style={{
              maxWidth: 320, maxHeight: 220, borderRadius: 10, boxShadow: '0 0 16px #fff70088', marginBottom: 6
            }}/>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="chat-messages" ref={msgListRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-bubble ${msg.from}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* END BUTTON */}
      <button
        className="end-btn"
        onClick={handleEnd}
        onMouseEnter={() => setShowTutorial({ help: false, clue: false, end: true })}
        onMouseLeave={closeTutorial}
      >
        Zakończ Przesłuchanie
      </button>

      {/* INPUT + SEND */}
      <form className="input-row" onSubmit={handleSend} autoComplete="off">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Napisz wiadomość..."
          maxLength={800}
          autoFocus={false}
          style={{fontSize: '1.08rem'}}
        />
        <button className="input-send-btn" type="submit" tabIndex={0} aria-label="Wyślij">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M2 24L24 13L2 2V10L17 13L2 16V24Z" fill="white"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

// TutorialTip component – NA KOŃCU pliku, przed exportem
function TutorialTip({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.40)', display: 'flex',
        justifyContent: 'center', alignItems: 'flex-end', zIndex: 200
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          marginBottom: 80,
          background: '#292932',
          borderRadius: 18,
          padding: '22px 28px',
          color: '#fff',
          boxShadow: '0 2px 24px #0004',
          maxWidth: 350,
          minWidth: 250,
          fontSize: '1.13rem',
          textAlign: 'center',
          border: '2px solid #ffe400'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ChatBox;
