import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/system';
import Login from './components/Login';
import Signup from './components/Signup';
import theme from './utils/ThemeUtils';
import ChatPage from './components/ChatPage';
import RedirectWithLang from './utils/RedirectWithLang';
import './App.css';


function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };


  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/:lang/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/login" element={<RedirectWithLang to="/login" />} />
            <Route path="/:lang/register" element={<Signup onLogin={handleLogin} />} />
            <Route path="/register" element={<RedirectWithLang to="/register" />} />
            <Route path="/:lang/chat" element={<ChatPage token={token} onLogout={handleLogout} />} />
            <Route path="/chat" element={<RedirectWithLang to="/chat" />} />
            <Route path="/" element={<RedirectWithLang to="/login" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
