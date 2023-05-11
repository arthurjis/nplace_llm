import React, { useState } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function Login({ setToken }) {
  const [id, setId] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${SERVER_URL}/login`, { id, passcode });
      setToken(response.data.access_token);
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          User ID:
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} required />
        </label>
        <label>
          Passcode:
          <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />
        </label>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
