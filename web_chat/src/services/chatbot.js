import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export async function sendMessageToChatbot(message) {
  // Retrieve the token from local storage
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${SERVER_URL}/send_message`, {
      message: message,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    return null;
  }
}

