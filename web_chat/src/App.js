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



  return (
    <div className="App">
      {token ? (
        <Chat />
      ) : showRegistration ? (
        <Registration onLogin={handleLogin} />
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <button onClick={() => setShowRegistration(true)}>Register</button>
        </>
      )}
    </div>
  );
}

export default App;