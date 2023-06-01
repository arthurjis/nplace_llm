import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import SocketContext from './contexts/SocketContext';
import Chat from './components/Chat';
import ChatSessionList from './components/ChatSessionList';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';


function App() {

  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectedChatSession, setSelectedChatSession] = useState(null);
  const [refreshChatSessionsSignal, setRefreshChatSessionsSignal] = useState(Date.now());

  const handleLogin = (token) => {
    // Initialize socket connection here
    const newSocket = socketIOClient(process.env.REACT_APP_SERVER_URL, {
      query: { token }
    });
    setSocket(newSocket);
    setToken(token);
    localStorage.setItem('token', token);
  }

  const handleLogout = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
    setSelectedChatSession(null);
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleStartChat = () => {
    setSelectedChatSession(null);
  }

  const handleChatSessionSelect = (chatSession) => {
    setSelectedChatSession(chatSession);
    console.log("app.js selecting chat session " + chatSession)
  }

  const handleRefreshChatSessions = () => {
    setRefreshChatSessionsSignal(Date.now());
  };

  useEffect(() => {
    // Return function to clean up socket connection on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  if (token) {
    return (
      <SocketContext.Provider value={socket}>
        <div className="App">
          <div className="flex-container">
            <ChatSessionList 
              token={token} 
              onChatSessionSelect={handleChatSessionSelect} 
              refreshChatSessionsSignal={refreshChatSessionsSignal} 
            />
            <div>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={handleStartChat}>Start New Chat Session</button>
              <Chat 
                setSelectedChatSession={setSelectedChatSession} 
                selectedChatSession={selectedChatSession}
                refreshChatSessions={handleRefreshChatSessions}
              />
            </div>
          </div>
        </div>
      </SocketContext.Provider>
    );
  }

  return (
    <Router>
      <SocketContext.Provider value={socket}>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Signup onLogin={handleLogin} />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </SocketContext.Provider>
    </Router>
  );
}

export default App;
