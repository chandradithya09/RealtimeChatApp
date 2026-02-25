import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const registerUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      alert(res.data.msg);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "var(--bg-main)",
      }}
    >
      <div
        style={{
          background: "var(--bg-secondary)",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "var(--shadow-card)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "bold" }}>
          Create an Account
        </h2>

        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={registerUser}
          style={{
            width: "100%",
            padding: "14px",
            background: "var(--accent-primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s",
            marginBottom: "16px",
          }}
          onMouseOver={(e) => (e.target.style.background = "var(--accent-primary-hover)")}
          onMouseOut={(e) => (e.target.style.background = "var(--accent-primary)")}
        >
          Register
        </button>

        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "16px" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "var(--accent-primary)", cursor: "pointer", fontWeight: "bold" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
