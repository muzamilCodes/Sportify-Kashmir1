import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";

const Register = () => {
  const [username, setusername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);

  const navigate = useNavigate();

  const formBody = {
    username,
    email,
    password,
  };

  const handleRegister = async (event) => {
    try {
      event.preventDefault();
      setloading(true);

      const res = await axiosInstance.post("/user/register", formBody); // network api call

      if (res.status === 201) {
        toast.success(res.data.message);

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        if ([400, 401, 403, 500].includes(error.response.status)) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Network Error!");
      }
    } finally {
      setTimeout(() => {
        setloading(false);
      }, 3000);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "85vh", padding: "40px 15px" }}>
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
        <form onSubmit={handleRegister}>
          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: "#7fad39" }}>Create Account</h3>
            <p className="text-muted" style={{ fontSize: "14px" }}>Register with us for a premium shopping experience</p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>
              Username <span className="text-danger">*</span>
            </label>
            <input
              onChange={(event) => setusername(event.target.value)}
              className="form-control px-3 py-2"
              placeholder="Choose a username"
              type="text"
              value={username}
              required
              style={{ borderRadius: "8px", border: "1px solid #ddd" }}
            />
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
              placeholder="Create a password"
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
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          <div className="text-center mt-3">
            <p style={{ fontSize: "14px", margin: 0 }}>
              Already have an account? <Link to={"/login"} className="fw-bold" style={{ color: "#7fad39", textDecoration: "none" }}>Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
