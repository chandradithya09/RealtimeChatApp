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
        background: "#0f172a",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h2 style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "bold" }}>
          Create an Account
        </h2>

        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#cbd5e1" }}>
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
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#cbd5e1" }}>
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
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#cbd5e1" }}>
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
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
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
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s",
            marginBottom: "16px",
          }}
          onMouseOver={(e) => (e.target.style.background = "#16a34a")}
          onMouseOut={(e) => (e.target.style.background = "#22c55e")}
        >
          Register
        </button>

        <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "16px" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
