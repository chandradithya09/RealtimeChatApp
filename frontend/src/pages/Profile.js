import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [photo, setPhoto] = useState(null);

  const uploadProfilePic = async () => {
    if (!photo) {
      alert("Select a profile picture");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photo);

    const uploadRes = await axios.post(`${API_URL}/upload`, formData);

    const updateRes = await axios.put(
      `${API_URL}/api/profile/update/${user.id || user._id}`,
      { profilePic: uploadRes.data.imageUrl }
    );

    localStorage.setItem("user", JSON.stringify(updateRes.data));
    alert("Profile picture updated!");
    window.location.href = "/chat";
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Upload Profile Picture</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <br /><br />

      <button onClick={uploadProfilePic}>Upload</button>
    </div>
  );
}

export default Profile;
