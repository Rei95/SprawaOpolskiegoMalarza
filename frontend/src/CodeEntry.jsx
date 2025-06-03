// src/CodeEntry.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CodeEntry() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "1530") {
      window.location.href = "https://sprawaopolskiegomalarza-1.onrender.com/room/62587";
    } else {
      setError("Błędny kod. Malarz ma twoje koordynaty i zmierza w twoją stronę...");
    }
  };

  return (
    <div style={styles.bg}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#ffffff"
          width="48px"
          height="48px"
          style={styles.lockIcon}
        >
          <path d="M12 17a2 2 0 0 1-1-3.732V12a1 1 0 1 1 2 0v1.268A2 2 0 0 1 12 17zm6-7h-1V7a5 5 0 0 0-10 0v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM9 7a3 3 0 1 1 6 0v3H9V7zm9 13H6v-8h12v8z" />
        </svg>

        <h2 style={styles.title}>Wpisz 4-cyfrowy kod</h2>

        <input
          type="text"
          maxLength="4"
          pattern="\d{4}"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
          placeholder="____"
        />

        <div style={{ marginTop: "16px" }}>
          <button type="submit" style={styles.button}>Sprawdź kod</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  bg: {
    background: "#111",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    background: "#1a1a1a",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 0 24px #720026",
    textAlign: "center",
    width: "90%",
    maxWidth: 400,
  },
  lockIcon: {
    marginBottom: 10,
  },
  title: {
    color: "#e6005c",
    marginBottom: 16,
  },
  input: {
    fontSize: "2em",
    textAlign: "center",
    padding: "10px",
    width: "100%",
    maxWidth: "200px",
    border: "none",
    borderRadius: "8px",
    marginBottom: "8px",
    background: "#333",
    color: "#fff",
  },
  button: {
    backgroundColor: "#720026",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    marginTop: "16px",
    color: "#ff4444",
    fontWeight: "bold",
  },
};
