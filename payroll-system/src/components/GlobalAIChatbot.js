import React, { useState, useEffect, useRef } from "react";
import { aiAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

function GlobalAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const greeting = {
        id: "G001",
        sender: "ai",
        text: `Hello! I am your TechNova AI Assistant. Ask me anything about leaves, salaries, tax deductions, check-in schedules, or corporate dress code policies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const savedChat = JSON.parse(localStorage.getItem("hrms_global_chat")) || [greeting];
      setMessages(savedChat);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveChat = (updatedMessages) => {
    localStorage.setItem("hrms_global_chat", JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = {
      id: "U-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    saveChat(newMessages);
    setInputText("");
    setLoading(true);

    try {
      const res = await aiAPI.chat(query);
      if (res.data.success) {
        const aiReply = {
          id: "AI-" + Date.now(),
          sender: "ai",
          text: res.data.reply,
          timestamp: res.data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        saveChat([...newMessages, aiReply]);
      }
    } catch (err) {
      console.error(err);
      const errorReply = {
        id: "ERR-" + Date.now(),
        sender: "ai",
        text: "I am having trouble accessing the AI server. Let me know if your backend port is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveChat([...newMessages, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all global assistant messages?")) {
      const reset = [{
        id: "G001",
        sender: "ai",
        text: `Hello! I am your TechNova AI Assistant. Ask me anything about leaves, salaries, tax deductions, check-in schedules, or corporate dress code policies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      saveChat(reset);
    }
  };

  // Basic parser to render bold, headers and bullet points from markdown response
  const renderMessageText = (text) => {
    return text.split("\n").map((line, i) => {
      let content = line;
      
      // Headers
      if (content.startsWith("### ")) {
        return <h6 key={i} className="fw-bold text-primary mt-2 mb-1">{content.replace("### ", "")}</h6>;
      }
      if (content.startsWith("## ")) {
        return <h6 key={i} className="fw-bold mt-2 mb-1 text-uppercase">{content.replace("## ", "")}</h6>;
      }
      if (content.startsWith("* ") || content.startsWith("- ")) {
        const cleaned = content.substring(2);
        return (
          <li key={i} className="ms-3 mb-1 list-unstyled d-flex align-items-start">
            <i className="bi bi-circle-fill text-info me-2 mt-2" style={{ fontSize: "5px" }}></i>
            <span>{parseBoldText(cleaned)}</span>
          </li>
        );
      }
      return <p key={i} className="mb-1">{parseBoldText(content)}</p>;
    });
  };

  const parseBoldText = (txt) => {
    const parts = txt.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      return index % 2 === 1 ? <strong key={index} className="fw-bold">{part}</strong> : part;
    });
  };

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) return null;

  return (
    <div className="position-fixed" style={{ bottom: "25px", right: "25px", zIndex: 9999 }}>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="btn d-flex align-items-center justify-content-center shadow-lg"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
          color: "white",
          border: "none",
          fontSize: "24px"
        }}
      >
        {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-robot"></i>}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            className="card shadow-2xl overflow-hidden mt-3"
            style={{
              position: "absolute",
              bottom: "75px",
              right: "0",
              width: "360px",
              height: "480px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header */}
            <div className="p-3 text-white d-flex justify-content-between align-items-center"
              style={{ background: "linear-gradient(90deg, #0f2027, #203a43)" }}>
              <div className="d-flex align-items-center">
                <i className="bi bi-cpu-fill text-info me-2 fs-5"></i>
                <div>
                  <h6 className="m-0 fw-bold">TechNova AI Helpdesk</h6>
                  <small className="opacity-75" style={{ fontSize: "10px" }}>Active Support Bot</small>
                </div>
              </div>
              <button className="btn btn-sm btn-outline-danger border-0 text-white" onClick={clearChat} title="Clear Conversation">
                <i className="bi bi-trash"></i>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-grow-1 p-3 overflow-auto bg-light" style={{ fontSize: "13px" }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`d-flex mb-3 ${m.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`p-2.5 rounded-3 shadow-sm ${
                      m.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-white text-dark border-start border-4 border-info"
                    }`}
                    style={{ maxWidth: "80%", borderRadius: "10px" }}
                  >
                    <div>{renderMessageText(m.text)}</div>
                    <small className="d-block text-end mt-1 text-muted opacity-75" style={{ fontSize: "8px" }}>
                      {m.timestamp}
                    </small>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="d-flex mb-3 justify-content-start">
                  <div className="bg-white p-3 rounded-3 shadow-sm border-start border-4 border-info">
                    <span className="spinner-grow spinner-grow-sm text-info me-1" role="status"></span>
                    <span className="spinner-grow spinner-grow-sm text-info me-1" role="status"></span>
                    <span className="spinner-grow spinner-grow-sm text-info" role="status"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-2 py-1.5 bg-white border-top border-bottom d-flex gap-1.5 overflow-auto" style={{ whiteSpace: "nowrap", fontSize: "11px" }}>
              <button className="btn btn-xs btn-outline-info rounded-pill px-2.5 py-0.5" style={{ fontSize: "11px" }}
                onClick={() => handleSendMessage("Explain HRA and Tax calculations.")}>
                📋 Tax info
              </button>
              <button className="btn btn-xs btn-outline-info rounded-pill px-2.5 py-0.5" style={{ fontSize: "11px" }}
                onClick={() => handleSendMessage("What are standard office timings?")}>
                🕒 Office hours
              </button>
              <button className="btn btn-xs btn-outline-info rounded-pill px-2.5 py-0.5" style={{ fontSize: "11px" }}
                onClick={() => handleSendMessage("How do I request Sick leave?")}>
                📅 Leaves
              </button>
            </div>

            {/* Input field */}
            <div className="p-2.5 bg-white border-top">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ask anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                />
                <button
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => handleSendMessage()}
                  disabled={loading}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobalAIChatbot;
