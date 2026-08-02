import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPass) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:4000/user/change/password?token=${token}`,
        { password, confirmPass }
      );

      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirect after success
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong!";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>
      <form onSubmit={handleReset} style={styles.form}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {message && (
          <p
            style={{
              ...styles.message,
              color: message.toLowerCase().includes("successfully") ? "green" : "red"
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: 400,
    margin: '50px auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 8,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  input: {
    padding: 10,
    fontSize: 16,
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  message: {
    marginTop: 10,
    color: 'red',
  },
};

export default ResetPassword;
