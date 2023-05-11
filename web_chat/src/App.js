import React from 'react';
import axios from 'axios';
import Chat from './components/Chat';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {

  const handleLogin = async (id, passcode) => {

    const SERVER_URL = process.env.REACT_APP_SERVER_URL;

    try {
      const response = await axios.post(`${SERVER_URL}/login`, { id, passcode });
      localStorage.setItem('token', response.data.access_token);
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div className="App">
      <LoginForm onLogin={handleLogin} />
      <Chat />
    </div>
  );
}

export default App;