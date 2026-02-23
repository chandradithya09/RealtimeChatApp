import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(API_URL);

function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState(false);

  const bottomRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    socket.emit("addUser", user.id || user._id);

    socket.on("getOnlineUsers", (data) => {
      setOnlineUsers(data);
    });

    const fetchUsers = async () => {
      const res = await axios.get(`${API_URL}/api/user`);
      setUsers(res.data.filter((u) => u._id !== (user.id || user._id)));
    };

    fetchUsers();

    return () => socket.off("getOnlineUsers");
  }, [user.id, user._id]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", () => {
      setTypingStatus(true);
    });

    socket.on("stopTyping", () => {
      setTypingStatus(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isOnline = (id) => {
    return onlineUsers.includes(id);
  };

  const openChat = async (u) => {
    setSelectedUser(u);

    const res = await axios.post(`${API_URL}/api/chat/create`, {
      userId1: user.id || user._id,
      userId2: u._id,
    });

    setChatId(res.data._id);

    socket.emit("joinChat", res.data._id);

    const msgRes = await axios.get(
      `${API_URL}/api/message/${res.data._id}`
    );

    setMessages(msgRes.data);
  };

  const sendMessage = async () => {
    if (!chatId) {
      alert("Select a user first");
      return;
    }

    if (!text.trim() && !photo) return;

    let imageUrl = "";

    if (photo) {
      const formData = new FormData();
      formData.append("photo", photo);

      const res = await axios.post(`${API_URL}/upload`, formData);
      imageUrl = res.data.imageUrl;
    }

    socket.emit("sendMessage", {
      chatId: chatId,
      senderId: user.id || user._id,
      text: text,
      image: imageUrl,
    });

    socket.emit("stopTyping", { chatId });

    setText("");
    setPhoto(null);
  };

  const handleTyping = (value) => {
    setText(value);

    if (!chatId) return;

    if (value.length > 0) {
      socket.emit("typing", { chatId });
    } else {
      socket.emit("stopTyping", { chatId });
    }
  };

  const clearChat = async () => {
    if (!chatId) return;

    const confirmClear = window.confirm(
      "Are you sure you want to clear this chat?"
    );

    if (!confirmClear) return;

    await axios.delete(`${API_URL}/api/message/clear/${chatId}`);
    setMessages([]);
    alert("Chat cleared!");
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Delete this user permanently?");

    if (!confirmDelete) return;

    await axios.delete(`${API_URL}/api/user/delete/${id}`);

    setUsers(users.filter((u) => u._id !== id));

    if (selectedUser && selectedUser._id === id) {
      setSelectedUser(null);
      setChatId(null);
      setMessages([]);
    }

    alert("User deleted!");
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Segoe UI, Arial",
        background: "#0f172a",
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "30%",
          background: "#111827",
          borderRight: "1px solid #334155",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px",
            fontSize: "18px",
            fontWeight: "bold",
            background: "#1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Chat App
          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              background: "#ef4444",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>

        {/* Users list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {users.map((u) => (
            <div
              key={u._id}
              style={{
                padding: "14px",
                cursor: "pointer",
                borderBottom: "1px solid #334155",
                background:
                  selectedUser?._id === u._id ? "#2563eb" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => openChat(u)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={u.profilePic || "https://via.placeholder.com/40"}
                  alt="pic"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    border: "2px solid #475569",
                  }}
                />

                <div>
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                    {u.name}
                  </div>

                  <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                    {isOnline(u._id) ? "🟢 Online" : "⚫ Offline"}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteUser(u._id);
                }}
                style={{
                  padding: "6px 10px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: "18px",
            background: "#1e293b",
            borderBottom: "1px solid #334155",
            fontWeight: "bold",
            fontSize: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {selectedUser ? (
            <div>
              {selectedUser.name}{" "}
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                ({isOnline(selectedUser._id) ? "Online" : "Offline"})
              </span>
              <div style={{ fontSize: "12px", color: "#22c55e" }}>
                {typingStatus ? "Typing..." : ""}
              </div>
            </div>
          ) : (
            "Select a user to start chat"
          )}

          {selectedUser && (
            <button
              onClick={clearChat}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: "#f59e0b",
                fontWeight: "bold",
              }}
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "18px",
            overflowY: "auto",
            background: "#0b1220",
          }}
        >
          {selectedUser ? (
            messages.map((msg, index) => {
              const isMe =
                msg.senderId?.toString() === (user.id || user._id);

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      background: isMe ? "#3b82f6" : "#334155",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      maxWidth: "60%",
                      color: "white",
                    }}
                  >
                    {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}

                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="sent"
                        style={{
                          width: "220px",
                          borderRadius: "12px",
                          marginTop: "8px",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <h2 style={{ textAlign: "center", color: "#94a3b8" }}>
              Select a user from left panel
            </h2>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        {selectedUser && (
          <div
            style={{
              padding: "12px",
              background: "#111827",
              borderTop: "1px solid #334155",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={text}
              placeholder="Type message..."
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #334155",
                outline: "none",
                background: "#0f172a",
                color: "white",
              }}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              style={{ color: "white" }}
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: "#22c55e",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
