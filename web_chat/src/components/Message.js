import React from 'react';
import './Message.css';

function Message({ message, isLocal }) {
  return (
    <div className={`message ${isLocal ? 'message--local' : 'message--remote'}`}>
      <img src={message.profilePhoto} alt={message.username} className="message__profile-photo" />
      <div className="message__content">
        <span className="message__username">{message.username}</span>
        <p className="message__text">{message.text}</p>
      </div>
    </div>
  );
}

export default Message;
