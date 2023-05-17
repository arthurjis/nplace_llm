import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './ChatSessionList.css';

const ChatSessionList = ({ chatSessions }) => {
  const history = useHistory();

  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const handleSessionClick = (session) => {
    setSelectedSessionId(session.id);
    // Additional logic for loading chat history and emitting events
  };


  return (
    <div className="chat-session-list">
      {chatSessions.map((session) => (
        <div
          key={session.id}
          onClick={() => handleSessionClick(session)}
          className={`chat-session-item ${
            selectedSessionId === session.id ? 'selected' : ''
          }`}
        >
          <div className="session-name">{session.name}</div>
        </div>
      ))}
    </div>
  );
  
};

export default ChatSessionList;
