import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.png'; // <-- Ścieżka do Twojego logo

function MailForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Podaj poprawny email!');
      return;
    }
    // Sprawdź email w backendzie (możesz zmienić adres, jeśli inny port/backend)
    const res = await fetch('http://localhost:3001/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.exists) {
      setError('Ten email już był użyty!');
      return;
    }
    // Jeśli OK, przenosimy do pokoju 1 (lub możesz dodać wybór pokoju)
    navigate('/room/1');
  };

  return (
    <div style={{
      background: "#1a1a1a",
      borderRadius: 12,
      boxShadow: "0 0 24px #720026",
      padding: 24,
      color: "#fff",
      maxWidth: 400,
      margin: "80px auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* LOGO */}
      <img
        src={logo}
        alt="Logo firmy"
        style={{
          width: 120,
          height: 'auto',
          marginBottom: 18,
          borderRadius: 14,
          boxShadow: '0 0 10px #72002655',
          objectFit: 'contain'
        }}
      />

      <h2 style={{ marginBottom: 16, textAlign: 'center' }}>
        Wpisz email, aby rozpocząć przesłuchanie
      </h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="email"
          placeholder="Twój email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#fff',
            color: '#111'
          }}
        />
        {error && <div style={{ color: '#e05', marginBottom: 10 }}>{error}</div>}
        <button
          type="submit"
          style={{
            background: '#720026',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: 8
          }}
        >
          Rozpocznij przesłuchanie
        </button>
      </form>
    </div>
  );
}

export default MailForm;
