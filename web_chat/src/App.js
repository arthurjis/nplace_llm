import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import SocketContext from './contexts/SocketContext';
import Chat from './components/Chat';
import Login from './components/Login';
import Registration from './components/Registration';
import './App.css';

function App() {

  const [token, setToken] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [socket, setSocket] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const newSocket = socketIOClient(process.env.REACT_APP_SERVER_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  if (token) {
    return (
      <SocketContext.Provider value={socket}>
        <div className="App">
          <Chat />
          <button onClick={handleLogout}>Logout</button>
        </div>
      </SocketContext.Provider>
    );
  }

  if (showRegistration) {
    return (
      <SocketContext.Provider value={socket}>
        <div className="App">
          <Registration onLogin={handleLogin} />
          <button onClick={() => setShowRegistration(false)}>Back</button>
        </div>
      </SocketContext.Provider>
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        <Login onLogin={handleLogin} />
        <button onClick={() => setShowRegistration(true)}>Register</button>
      </div>
    </SocketContext.Provider>
  );

}

export default App;