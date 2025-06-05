import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);

  const MAX_QUESTIONS = 5;
  const [questionsCount, setQuestionsCount] = useState(0);
  const [chatBlocked, setChatBlocked] = useState(false);

  const navigate = useNavigate();
  const { roomId } = useParams();
  const msgListRef = useRef(null);

  // Blokada czatu na podstawie localStorage (przy wejściu do pokoju)
  useEffect(() => {
    if (roomId && localStorage.getItem('blocked-room-' + roomId) === '1') {
      setChatBlocked(true);
      setQuestionsCount(MAX_QUESTIONS);
    }
  }, [roomId]);

  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages]);

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

  const currentStepKey = tutorialSteps[tutorialStep]?.key;
  const highlightHelp = showTutorial && currentStepKey === 'help';
  const highlightClue = showTutorial && currentStepKey === 'clue';
  const highlightEnd = showTutorial && currentStepKey === 'end';

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .tutorial-highlight {
      box-shadow: 0 0 0 3px #ffe400, 0 0 14px 5px #ffe40099;
      border-radius: 50% !important;
      animation: tutorial-pulse 1.1s infinite;
      z-index: 20 !important;
      position: relative;
    }
    .tutorial-highlight-btn {
      box-shadow: 0 0 0 3px #ffe400, 0 0 18px 3px #ffe400bb;
      border-radius: 14px !important;
      animation: tutorial-pulse-btn 1.05s infinite;
      z-index: 20 !important;
      position: relative;
    }
    @keyframes tutorial-pulse {
      0% { box-shadow: 0 0 0 2.5px #ffe400, 0 0 12px 2px #ffe40044;}
      60% { box-shadow: 0 0 0 6px #ffe400, 0 0 22px 9px #ffe400b2;}
      100% { box-shadow: 0 0 0 2.5px #ffe400, 0 0 12px 2px #ffe40044;}
    }
    @keyframes tutorial-pulse-btn {
      0% { box-shadow: 0 0 0 3px #ffe400, 0 0 12px 2px #ffe40044;}
      60% { box-shadow: 0 0 0 12px #ffe400, 0 0 36px 13px #ffe400a8;}
      100% { box-shadow: 0 0 0 3px #ffe400, 0 0 12px 2px #ffe40044;}
    }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // handleEnd usunięty - przycisk "Zakończ przesłuchanie" usunięty

  const handleSend = async (e) => {
    e.preventDefault();
    if (chatBlocked || !input.trim()) return;

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
    setQuestionsCount(count => {
      if (count + 1 >= MAX_QUESTIONS) {
        setChatBlocked(true);
        if (roomId) {
          localStorage.setItem('blocked-room-' + roomId, '1');
        }
      }
      return count + 1;
    });
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
              className={`round-btn ${highlightHelp ? "tutorial-highlight" : ""}`}
              id="help-btn"
              type="button"
              aria-label="Podpowiedź"
              onClick={() => setShowHelp(true)}
              tabIndex={0}
              style={{zIndex: highlightHelp ? 21 : 2}}
            >?</button>
            <button
              className={`round-btn star ${highlightClue ? "tutorial-highlight" : ""}`}
              id="clue-btn"
              type="button"
              aria-label="Poszlaka"
              onClick={() => setShowClue(true)}
              style={{
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: highlightClue ? 21 : 2
              }}
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

      {/* Komunikat o zablokowaniu czatu */}
      {chatBlocked && (
        <div style={{
          background: '#222',
          color: '#ffe400',
          padding: '18px 22px',
          borderRadius: 15,
          margin: '20px auto 8px auto',
          maxWidth: 380,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '1.08em',
          boxShadow: '0 2px 12px #ffe40011'
        }}>
          Świadek zakończył z Tobą rozmowę. Nie możesz już zadawać więcej pytań.
        </div>
      )}

      {/* INPUT + SEND */}
      <form className="input-row" onSubmit={handleSend} autoComplete="off">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={chatBlocked ? "Limit pytań wyczerpany" : "Napisz wiadomość..."}
          maxLength={800}
          autoFocus={false}
          style={{fontSize: '1.08rem'}}
          disabled={chatBlocked}
        />
        <button
          className="input-send-btn"
          type="submit"
          tabIndex={0}
          aria-label="Wyślij"
          disabled={chatBlocked}
          style={chatBlocked ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M2 24L24 13L2 2V10L17 13L2 16V24Z" fill="white"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

function OnboardingTooltip({ step, stepNum, stepCount, onNext, onSkip }) {
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  let style = {};
  if (isMobile || coords.top === null) {
    style = {
      position: 'fixed',
      left: '50%',
      bottom: '48px',
      transform: 'translateX(-50%)',
      zIndex: 3000,
      width: 'min(94vw, 370px)',
      pointerEvents: 'none'
    };
  } else {
    style = {
      position: 'absolute',
      top: coords.top + coords.height + 18,
      left: coords.left + coords.width / 2 - 175,
      zIndex: 3000,
      width: 350,
      maxWidth: 'calc(100vw - 24px)',
      minWidth: 180,
      pointerEvents: 'none'
    };
    if (style.left < 12) style.left = 12;
  }

  return (
    <div style={style} className="onboarding-tooltip">
      <div style={{
        background: '#1a1a21F6',
        borderRadius: 20,
        boxShadow: '0 6px 32px #0007, 0 0px 0px #fff2',
        padding: '22px 22px 18px 22px',
        color: '#fff',
        border: '1.5px solid #ffe400',
        fontSize: '1.08rem',
        lineHeight: 1.7,
        textAlign: 'center',
        fontWeight: 400,
        maxWidth: 370,
        margin: '0 auto',
        pointerEvents: 'auto',
        backdropFilter: 'blur(6px)',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{
          fontWeight:700,
          color:'#ffe400',
          fontSize:'1.17em',
          marginBottom: 8,
          letterSpacing:0.2
        }}>{step.title}</div>
        <div style={{
          marginBottom: 16,
          fontSize: '1.01em',
          color:'#fff',
          fontWeight: 500
        }}>{step.text}</div>
        <div style={{
          display:'flex',
          gap:10,
          justifyContent:'center',
          margin:'0 0 12px 0'
        }}>
          <button
            onClick={onNext}
            style={{
              background: '#ffe400',
              color: '#181818',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '1.06em',
              padding: '8px 26px',
              cursor: 'pointer',
              boxShadow:'0 2px 12px #ffe40022',
              outline:'none',
              transition: 'background .18s',
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
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '1.05em',
              padding: '8px 23px',
              cursor: 'pointer',
              outline:'none',
              transition: 'background .18s,color .18s'
            }}
          >Pomiń</button>
        </div>
        <div style={{
          fontSize:'0.92em',
          color:'#ffe40077',
          marginTop:3,
          fontWeight:500,
          letterSpacing:0.4
        }}>
          {stepNum+1} / {stepCount}
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
