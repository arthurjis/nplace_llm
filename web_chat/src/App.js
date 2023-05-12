import React, { useState } from 'react';
import Chat from './components/Chat';
import Login from './components/Login';
import Registration from './components/Registration';
import './App.css';

function App() {

  const [token, setToken] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (token) {
    return (
      <div className="App">
        <Chat />
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (showRegistration) {
    return (
      <div className="App">
        <Registration onLogin={handleLogin} />
        <button onClick={() => setShowRegistration(false)}>Back</button>
      </div>
    );
  }

  return (
    <div className="App">
      <Login onLogin={handleLogin} />
      <button onClick={() => setShowRegistration(true)}>Register</button>
    </div>
  );
}

export default App;