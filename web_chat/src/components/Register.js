import React, { useState } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function Register() {
  const [id, setId] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${SERVER_URL}/register`, { id, passcode });
      alert('Registered successfully');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          User ID:
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} required />
        </label>
        <label>
          Passcode:
          <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
