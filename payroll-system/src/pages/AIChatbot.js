import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { aiAPI } from "../services/api";

function AIChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Ref to automatically scroll to bottom of chat
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial greeting
    const greeting = {
      id: "M001",
      sender: "ai",
      text: `Hello! I am your Payroll Pro AI Assistant. How can I assist you today? You can query me on 'employee counts', 'monthly payroll budget details', 'active leaves', or general 'company office policies'.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const savedChat = JSON.parse(localStorage.getItem("hrms_ai_chat")) || [greeting];
    setMessages(savedChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveChat = (updatedMessages) => {
    localStorage.setItem("hrms_ai_chat", JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = {
      id: "M" + (messages.length + 1),
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
          id: "M" + (newMessages.length + 1),
          sender: "ai",
          text: res.data.reply,
          timestamp: res.data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        saveChat([...newMessages, aiReply]);
      }
    } catch (err) {
      console.error(err);
      const errorReply = {
        id: "M" + (newMessages.length + 1),
        sender: "ai",
        text: "I apologize, but I am experiencing issues communicating with my core knowledge database right now. Please try again in a moment.",
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

  const clearChatHistory = () => {
    if (window.confirm("Clear conversation history?")) {
      const resetGreeting = [{
        id: "M001",
        sender: "ai",
        text: `Hello! I am your Payroll Pro AI Assistant. How can I assist you today? You can query me on 'employee counts', 'monthly payroll budget details', 'active leaves', or general 'company office policies'.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      saveChat(resetGreeting);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">
              <i className="bi bi-cpu-fill text-primary me-2"></i>AI Assistant
            </h2>
            <span className="badge bg-dark px-3 py-2 fs-6">Module: AI & HR Insights</span>
          </div>

          <div className="row">
            {/* Left Column: Chatbot Workspace */}
            <div className="col-lg-8 mb-4">
              <div className="chat-window shadow-sm" style={{ borderRadius: "15px", overflow: "hidden", background: "#fff" }}>
                {/* Chat Header */}
                <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                        alt="bot avatar" width="40" height="40" className="rounded-circle border"
                      />
                      <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-1" style={{ width: "10px", height: "10px" }}></span>
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold">Payroll Pro AI Bot</h6>
                      <small className="text-light" style={{ fontSize: "10px" }}>Model Inferences Live</small>
                    </div>
                  </div>
                  <button className="btn btn-outline-danger btn-sm border-0" onClick={clearChatHistory} title="Clear Chat">
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                {/* Messages List */}
                <div className="chat-messages bg-light" style={{ height: "350px", overflowY: "auto", padding: "20px" }}>
                  {messages.map(m => (
                    <div 
                      key={m.id} 
                      className={`chat-bubble mb-3 p-3 rounded-3 shadow-sm ${m.sender === "ai" ? "bg-white text-dark border-start border-primary border-4" : "bg-primary text-white ms-auto"}`}
                      style={{ maxWidth: "75%", width: "fit-content" }}
                    >
                      <p className="m-0 small">{m.text}</p>
                      <small className="d-block text-end mt-1 text-muted" style={{ fontSize: "9px" }}>{m.timestamp}</small>
                    </div>
                  ))}
                  {loading && (
                    <div className="chat-bubble bg-white text-dark border-start border-primary border-4 p-3 rounded-3 shadow-sm" style={{ width: "80px" }}>
                      <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                      <span className="spinner-grow spinner-grow-sm text-primary ms-1" role="status"></span>
                      <span className="spinner-grow spinner-grow-sm text-primary ms-1" role="status"></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Quick Action Suggestions */}
                <div className="px-3 py-2 bg-white border-top border-bottom d-flex gap-2 overflow-auto" style={{ whiteSpace: "nowrap" }}>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => handleSendMessage("What is the general office policy?")}>
                    👗 Office Dress Policy
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => handleSendMessage("How many active employees are onboard?")}>
                    👥 Employee Strength
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => handleSendMessage("What is our monthly payroll budget?")}>
                    ₹ Financial Budget
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => handleSendMessage("Are there any approved leaves?")}>
                    📅 Active Leaves
                  </button>
                </div>

                {/* Chat Input Field */}
                <div className="chat-input-area p-3 bg-white">
                  <div className="input-group">
                    <input 
                      type="text" className="form-control" placeholder="Ask about policies, employee stats, salaries..." 
                      value={inputText} onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={loading}
                    />
                    <button className="btn btn-primary fw-bold px-4" onClick={() => handleSendMessage()} disabled={loading}>
                      <i className="bi bi-send-fill me-1"></i> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Analytics Deck */}
            <div className="col-lg-4 mb-4">
              <div className="card shadow-sm border-0 p-4 h-100 bg-white" style={{ borderRadius: "15px" }}>
                <h5 className="fw-bold mb-3"><i className="bi bi-cpu-fill text-primary me-2"></i>HR Sentiment Deck</h5>
                <p className="text-muted small">Real-time sentiment telemetry and predicted attrition ratings.</p>
                
                <div className="list-group list-group-flush mt-3">
                  <div className="list-group-item px-0 py-3 border-0 border-bottom">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold small text-dark">Employee Sentiment Index</span>
                      <span className="badge bg-success">84% Positive</span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div className="progress-bar bg-success" style={{ width: "84%" }}></div>
                    </div>
                  </div>

                  <div className="list-group-item px-0 py-3 border-0 border-bottom">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold small text-dark">Predicted Attrition Risk</span>
                      <span className="badge bg-info text-dark">5.8% (Very Low)</span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div className="progress-bar bg-info" style={{ width: "6%" }}></div>
                    </div>
                  </div>

                  <div className="list-group-item px-0 py-3 border-0">
                    <span className="fw-bold small text-dark d-block mb-1">Organizational AI Suggestion</span>
                    <div className="alert alert-warning border-0 p-3 mb-0 small">
                      <i className="bi bi-lightbulb-fill text-warning me-1"></i>
                      IT Department salary allocations currently represent <strong>42%</strong> of overall operating capital. Recommend deferring additional senior hiring cycles until Q4.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIChatbot;
