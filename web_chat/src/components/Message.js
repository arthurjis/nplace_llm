import React from 'react';
import './Message.css';

function Message({ message, isLocal }) {
  const profilePhotoUrl = isLocal ? '/logo192.png' : '/logo192.png';

  return (
    <div className={`message ${isLocal ? 'message--local' : 'message--remote'}`}>
      {<img src={profilePhotoUrl} alt={message.username} className="message__profile-photo" />}
      <div className="message__content-wrapper">
	    {!isLocal && <span className="message__username">{message.username}</span>}
	    <div className="message__content">
	      <p className="message__text">{message.text}</p>
	    </div>
	  </div>
	</div>
  );
}

export default Message;
