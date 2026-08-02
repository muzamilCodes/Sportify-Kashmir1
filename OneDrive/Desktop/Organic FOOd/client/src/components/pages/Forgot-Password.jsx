import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false); // 🔒 disable button after success

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/user/forgot-password", { email });
      setMessage(res.data.message);
      setDisabled(true); // ✅ disable button on success
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(errorMessage);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Forgot Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={disabled} style={{ 
          ...styles.button, 
          backgroundColor: disabled ? "#ccc" : "#007bff",
          cursor: disabled ? "not-allowed" : "pointer"
        }}>
          {disabled ? "Link Sent" : "Send Reset Link"}
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: 400,
    margin: "60px auto",
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif"
  },
  heading: {
    marginBottom: 20,
    fontSize: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    fontSize: 16,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  button: {
    padding: 10,
    fontSize: 16,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    transition: "background-color 0.3s ease",
  },
  message: {
    marginTop: 15,
    fontSize: 14,
    color: "green",
  },
};

export default ForgotPassword;
