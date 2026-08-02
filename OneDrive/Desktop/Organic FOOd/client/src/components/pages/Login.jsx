import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/userSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.user);

  const handleLogin = (event) => {
    event.preventDefault();
    dispatch(loginUser({ email, password, navigate }));
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "80vh", padding: "40px 15px" }}>
      <div 
        className="card p-4 p-md-5 shadow" 
        style={{ 
          maxWidth: "450px", 
          width: "100%", 
          borderRadius: "16px", 
          border: "1px solid rgba(127, 173, 57, 0.15)",
          background: "rgba(255, 255, 255, 0.95)"
        }}
      >
        <form onSubmit={handleLogin}>
          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: "#7fad39" }}>Welcome Back</h3>
            <p className="text-muted" style={{ fontSize: "14px" }}>Login to access your Organic Kashmir account</p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              onChange={(event) => setEmail(event.target.value)}
              className="form-control px-3 py-2"
              placeholder="Enter your email"
              type="email"
              value={email}
              required
              style={{ borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>
              Password <span className="text-danger">*</span>
            </label>
            <input
              onChange={(event) => setPassword(event.target.value)}
              className="form-control px-3 py-2"
              placeholder="Enter your password"
              type="password"
              value={password}
              required
              style={{ borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn text-white py-2 fw-semibold"
              disabled={loading}
              style={{ 
                backgroundColor: "#7fad39", 
                borderRadius: "8px",
                transition: "background-color 0.3s",
                border: "none"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#6b9230"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#7fad39"}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="text-center mt-3">
            <p style={{ fontSize: "14px", margin: "0 0 10px 0" }}>
              Don't have an account? <Link to={"/register"} className="fw-bold" style={{ color: "#7fad39", textDecoration: "none" }}>Register</Link>
            </p>
            <Link
              to="/forgot/password"
              style={{ textDecoration: 'none', color: '#6f6f6f', fontSize: "13px" }}
              onMouseOver={(e) => e.target.style.color = '#7fad39'}
              onMouseOut={(e) => e.target.style.color = '#6f6f6f'}
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
