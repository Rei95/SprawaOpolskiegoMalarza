// src/Final.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Final() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "4325") {
      window.location.href = "https://forms.gle/MX1AUCePkNgsScdf9"; // ← PODMIEN TUTAJ
    } else {
      setError("Błędny kod. Połącz cztery kolory z czterema cyframi z zagadki Malarza...");
    }
  };

  return (
    <div style={styles.bg}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Wpisz 4-cyfrowy kod aby dostać się do formularza finałowego</h2>
        <input
          type="text"
          maxLength="4"
          pattern="\d{4}"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
          placeholder="____"
        />
        <button type="submit" style={styles.button}>Sprawdź kod</button>
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
    marginBottom: "16px",
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
