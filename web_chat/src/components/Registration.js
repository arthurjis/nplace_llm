import React, { useState } from 'react';
import axios from 'axios';

const Registration = ({ onLogin }) => {
    const [id, setId] = useState('');
    const [passcode, setPasscode] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const SERVER_URL = process.env.REACT_APP_SERVER_URL;
        try {
            await axios.post(`${SERVER_URL}/register`, { id, passcode });
            const loginResponse = await axios.post(`${SERVER_URL}/login`, { id, passcode });
            onLogin(loginResponse.data.access_token);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registration</h2>
            <input type="text" placeholder="ID" value={id} onChange={e => setId(e.target.value)} required />
            <input type="password" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} required />
            <button type="submit">Register</button>
        </form>
    )
}

export default Registration;
