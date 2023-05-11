import React, { useState }from 'react';
import axios from 'axios';
import Chat from './components/Chat';
import LoginForm from './components/LoginForm';
import Login from './components/Login';
import Register from './components/Register';

import './App.css';

function App() {

  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="App">
      {token ? (
        <>
          <button onClick={handleLogout}>Log Out</button>
          <Chat token={token} />
        </>
      ) : (
        <>
          <Login setToken={setToken} />
          <Register />
        </>
      )}
    </div>
  );
}

export default App;


  // const handleLogin = async (id, passcode) => {

  //   const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  //   try {
  //     const response = await axios.post(`${SERVER_URL}/login`, { id, passcode });
  //     localStorage.setItem('token', response.data.access_token);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }


  // return (
  //   <div className="App">
  //     <LoginForm onLogin={handleLogin} />
  //     <Chat />
  //   </div>
  // );
// }

// export default App;