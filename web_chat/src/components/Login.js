import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [id, setId] = useState('');
    const [passcode, setPasscode] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const SERVER_URL = process.env.REACT_APP_SERVER_URL;
        try {
            const response = await axios.post(`${SERVER_URL}/login`, { id, passcode });
            onLogin(response.data.access_token);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input type="text" placeholder="ID" value={id} onChange={e => setId(e.target.value)} required />
            <input type="password" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} required />
            <button type="submit">Login</button>
        </form>
    )
}

export default Login;
