import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { ThemeContext } from "../ThemeContext";
import { useNavigate } from "react-router-dom";

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

  const [lastMessages, setLastMessages] = useState({});
  const [viewedChats, setViewedChats] = useState({});

  const bottomRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

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

      try {
        const msgsRes = await axios.get(`${API_URL}/api/chat/last-messages/${user.id || user._id}`);
        const msgsMap = {};
        msgsRes.data.forEach((m) => {
          if (m.lastMessage) msgsMap[m.userId] = m.lastMessage;
        });
        setLastMessages(msgsMap);
      } catch (err) {
        console.error("Failed to load last messages", err);
      }
    };

    fetchUsers();

    return () => socket.off("getOnlineUsers");
  }, [user.id, user._id]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }

      setLastMessages((prev) => ({
        ...prev,
        [msg.senderId]: {
          text: msg.text,
          image: msg.image,
          senderId: msg.senderId,
          createdAt: msg.createdAt || new Date().toISOString()
        }
      }));

      setViewedChats((prev) => ({
        ...prev,
        [msg.senderId]: msg.chatId === chatId
      }));
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

  const isUnread = (u) => {
    if (viewedChats[u._id] !== undefined) {
      return !viewedChats[u._id];
    }
    const lastMsg = lastMessages[u._id];
    return lastMsg && lastMsg.senderId !== (user.id || user._id);
  };

  const openChat = async (u) => {
    setSelectedUser(u);
    setViewedChats((prev) => ({ ...prev, [u._id]: true }));

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

    setLastMessages((prev) => ({
      ...prev,
      [selectedUser._id]: {
        text: text,
        image: imageUrl,
        senderId: user.id || user._id,
        createdAt: new Date().toISOString()
      }
    }));

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
        background: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "30%",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
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
            background: "var(--bg-tertiary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            Chat App
            <button
              onClick={toggleTheme}
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                background: "var(--bg-main)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
          <div>
            <button
              onClick={() => navigate("/profile")}
              style={{
                padding: "6px 12px",
                background: "var(--accent-primary)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              My Profile
            </button>
            <button
              onClick={logout}
              style={{
                padding: "6px 12px",
                background: "var(--accent-danger)",
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
        </div>

        {/* Users list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {users.map((u) => (
            <div
              key={u._id}
              style={{
                padding: "14px",
                cursor: "pointer",
                borderBottom: "1px solid var(--border-color)",
                background:
                  selectedUser?._id === u._id ? "var(--bg-tertiary)" : "transparent",
                borderLeft: selectedUser?._id === u._id ? "4px solid var(--accent-primary)" : "4px solid transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all var(--transition-speed) ease",
              }}
              onMouseOver={(e) => {
                if (selectedUser?._id !== u._id) e.currentTarget.style.background = "var(--bg-tertiary)";
              }}
              onMouseOut={(e) => {
                if (selectedUser?._id !== u._id) e.currentTarget.style.background = "transparent";
              }}
              onClick={() => openChat(u)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                <img
                  src={u.profilePic || "https://via.placeholder.com/40"}
                  alt="pic"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    border: "2px solid var(--border-color)",
                    objectFit: "cover",
                  }}
                />

                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: isUnread(u) ? "900" : "500", fontSize: "15px" }}>
                    {u.name} {isOnline(u._id) && <span style={{ color: "var(--accent-success)", fontSize: "10px", marginLeft: "4px" }}>●</span>}
                  </div>

                  <div style={{
                    fontSize: "13px",
                    color: isUnread(u) ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: isUnread(u) ? "bold" : "normal",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {lastMessages[u._id] ? (lastMessages[u._id].text || "📷 Image") : "No messages yet"}
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
                  background: "var(--accent-danger)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginLeft: "10px",
                  transition: "background var(--transition-speed) ease",
                }}
                onMouseOver={(e) => (e.target.style.background = "var(--accent-danger-hover)")}
                onMouseOut={(e) => (e.target.style.background = "var(--accent-danger)")}
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
            background: "var(--bg-tertiary)",
            borderBottom: "1px solid var(--border-color)",
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
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                ({isOnline(selectedUser._id) ? "Online" : "Offline"})
              </span>
              <div style={{ fontSize: "12px", color: "var(--accent-success)" }}>
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
                background: "var(--accent-warning)",
                color: "#1e293b",
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
            background: "var(--bg-chat)",
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
                      background: isMe ? "var(--accent-primary)" : "var(--bg-tertiary)",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      maxWidth: "60%",
                      color: isMe ? "#ffffff" : "var(--text-primary)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      border: isMe ? "none" : "1px solid var(--border-color)",
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
            <h2 style={{ textAlign: "center", color: "var(--text-muted)" }}>
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
              background: "var(--bg-secondary)",
              borderTop: "1px solid var(--border-color)",
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
                border: "1px solid var(--border-color)",
                outline: "none",
                background: "var(--bg-main)",
                color: "var(--text-primary)",
              }}
            />

            {/* Redesigned File Upload Button */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                background: photo ? "var(--accent-success)" : "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                borderRadius: "50%",
                cursor: "pointer",
                color: photo ? "white" : "var(--text-primary)",
                fontSize: "20px",
                transition: "background 0.3s",
              }}
              title={photo ? "Image Selected" : "Upload Image"}
            >
              {photo ? "✓" : "📷"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>

            <button
              onClick={sendMessage}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: "var(--accent-primary)",
                color: "white",
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
