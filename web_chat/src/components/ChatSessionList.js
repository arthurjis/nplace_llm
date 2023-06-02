import ChatSessionItem from './ChatSessionItem';

import React, { useState, useEffect, useCallback } from 'react';

function ChatSessionList({ token, onChatSessionSelect, refreshChatSessionsSignal }) {
  const [chatSessions, setChatSessions] = useState([]);

const fetchChatSessions = useCallback(() => {
    fetch(process.env.REACT_APP_SERVER_URL + '/chat_sessions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Received ${data.chat_sessions.length} chat sessions`);
      console.log(data.chat_sessions);
      setChatSessions(data.chat_sessions);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }, [token]);
  
  useEffect(() => {
    fetchChatSessions();
  }, [token, refreshChatSessionsSignal, fetchChatSessions]);
  

  return (
    <div className="chat-session-list">
      {chatSessions.map(chatSession => (
        <ChatSessionItem
          key={chatSession.id}
          chatSession={chatSession}
          onSelect={onChatSessionSelect}
        />
      ))}
    </div>
  );
}

export default ChatSessionList;
