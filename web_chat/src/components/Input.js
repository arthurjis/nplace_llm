import React, { useState } from 'react';
import './Input.css';

function Input({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(message);
    setMessage('');
  };

  return (
    <form className="input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input__field"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button type="submit" className="input__submit">Send</button>
    </form>
  );
}

export default Input;
