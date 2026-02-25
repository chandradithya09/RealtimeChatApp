import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const uploadProfilePic = async () => {
    if (!photo) {
      alert("Select a profile picture");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photo);

    try {
      const uploadRes = await axios.post(`${API_URL}/upload`, formData);

      const updateRes = await axios.put(
        `${API_URL}/api/profile/update/${user.id || user._id}`,
        { profilePic: uploadRes.data.imageUrl }
      );

      localStorage.setItem("user", JSON.stringify(updateRes.data));
      alert("Profile picture updated!");
      navigate("/chat");
    } catch (error) {
      alert("Failed to upload profile picture");
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
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
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
          color: "var(--text-primary)",
        }}
      >
        <button
          onClick={() => navigate("/chat")}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          &larr;
        </button>

        <h2 style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "bold" }}>
          Update Profile Picture
        </h2>

        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "4px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            {photo ? (
              <img
                src={URL.createObjectURL(photo)}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Current"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "40px", color: "var(--text-muted)" }}>👤</span>
            )}
          </div>
        </div>

        <label
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
            color: "var(--text-primary)",
            fontWeight: "bold",
            transition: "background 0.3s",
          }}
        >
          Choose New Picture
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>

        <button
          onClick={uploadProfilePic}
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
          }}
          onMouseOver={(e) => (e.target.style.background = "var(--accent-primary-hover)")}
          onMouseOut={(e) => (e.target.style.background = "var(--accent-primary)")}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Profile;
