import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Tutorial steps data
const tutorialSteps = [
  {
    key: 'help',
    selector: '#help-btn',
    title: 'Podpowiedź',
    text: 'Kliknij tutaj, aby uzyskać wskazówki do rozmowy lub pokoju.',
  },
  {
    key: 'clue',
    selector: '#clue-btn',
    title: 'Poszlaka',
    text: 'Tutaj wyświetlisz ważną poszlakę związaną ze sprawą.',
  },
  {
    key: 'end',
    selector: '#end-btn',
    title: 'Zakończ przesłuchanie',
    text: 'Kliknij ten przycisk, aby zakończyć przesłuchanie i wrócić do ekranu głównego.',
  },
];

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

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(true);   // tutorial ON by default (change if you want)
  const [tutorialStep, setTutorialStep] = useState(0);

  const navigate = useNavigate();
  const { roomId } = useParams();
  const msgListRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus element for current tutorial step
  useEffect(() => {
    if (!showTutorial) return;
    const selector = tutorialSteps[tutorialStep]?.selector;
    if (selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showTutorial, tutorialStep]);

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

  if (ended) {
    return (
      <div className="chat-container" style={{justifyContent: 'center', alignItems: 'center', minHeight: '350px'}}>
        <h2 style={{ color: '#e05', textAlign: 'center', marginTop: 90 }}>Przesłuchanie zakończone</h2>
        <p style={{ textAlign: 'center' }}>Dziękujemy za udział! Za chwilę wrócisz do ekranu początkowego.</p>
      </div>
    );
  }

  return (
    <div className="chat-container" style={{position:'relative'}}>
      {/* TUTORIAL DYMKI */}
      {showTutorial && (
        <OnboardingTooltip
          step={tutorialSteps[tutorialStep]}
          stepNum={tutorialStep}
          stepCount={tutorialSteps.length}
          onNext={() => {
            if (tutorialStep < tutorialSteps.length - 1) setTutorialStep(s => s + 1);
            else setShowTutorial(false);
          }}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {/* HEADER */}
      <div className="header-area">
        <div className="avatar-row">
          {avatar && <img src={avatar} alt="Avatar" className="chat-avatar" />}
          <div className="action-btns">
            <button
              className="round-btn"
              id="help-btn"
              type="button"
              aria-label="Podpowiedź"
              onClick={() => setShowHelp(true)}
              tabIndex={0}
              style={{zIndex: 2}}
            >?</button>
            <button
              className="round-btn star"
              id="clue-btn"
              type="button"
              aria-label="Poszlaka"
              onClick={() => setShowClue(true)}
              style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex:2 }}
              tabIndex={0}
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
        id="end-btn"
        onClick={handleEnd}
        tabIndex={0}
        style={{zIndex: 2}}
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

// ONBOARDING TOOLTIP
function OnboardingTooltip({ step, stepNum, stepCount, onNext, onSkip }) {
  // Find position for the tooltip (responsive, near the target, fallback bottom for mobile)
  const [coords, setCoords] = useState({top: null, left: null, width: null, height: null});
  useEffect(() => {
    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [step]);

  // Responsywny styl: mobilki – bottom, desktop – przycisk
  const isMobile = window.innerWidth < 600;
  let style = {};
  if (isMobile || coords.top === null) {
    style = {
      position: 'fixed',
      left: '50%',
      bottom: 20,
      transform: 'translateX(-50%)',
      zIndex: 3000,
      maxWidth: 330,
      width: 'calc(100vw - 32px)',
    };
  } else {
    style = {
      position: 'absolute',
      top: coords.top + coords.height + 10,
      left: coords.left,
      zIndex: 3000,
      maxWidth: 330,
      minWidth: 200,
    };
    // Jeśli tooltip się nie mieści – popraw na lewo
    if (coords.left > window.innerWidth / 2) {
      style.left = coords.left + coords.width - 330;
      if (style.left < 0) style.left = 10;
    }
  }

  return (
    <div style={style} className="onboarding-tooltip">
      <div style={{
        background: '#292932',
        borderRadius: 16,
        padding: '22px 20px 16px 20px',
        color: '#fff',
        border: '2px solid #ffe400',
        boxShadow: '0 4px 24px #0005',
        fontSize: '1.05rem',
        lineHeight: 1.5,
        textAlign: 'center',
        position: 'relative',
        width: '100%',
      }}>
        <b style={{color: '#ffe400', fontSize: '1.09em', display:'block', marginBottom:6}}>{step.title}</b>
        <div style={{marginBottom: 10}}>{step.text}</div>
        <div style={{display:'flex', gap:8, justifyContent:'center'}}>
          <button
            onClick={onNext}
            style={{
              background: '#ffe400',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: '1.02em',
              padding: '7px 18px',
              cursor: 'pointer',
              marginTop:4
            }}
            autoFocus
          >
            {stepNum < stepCount-1 ? "Dalej" : "Zamknij"}
          </button>
          <button
            onClick={onSkip}
            style={{
              background: 'none',
              color: '#ffe400',
              border: '1.5px solid #ffe400',
              borderRadius: 9,
              fontWeight: 600,
              fontSize: '0.97em',
              padding: '7px 15px',
              cursor: 'pointer',
              marginTop:4
            }}
          >Pomiń</button>
        </div>
        <div style={{fontSize:'0.85em', marginTop:5, color:'#ffd700aa'}}>
          {stepNum+1} / {stepCount}
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
