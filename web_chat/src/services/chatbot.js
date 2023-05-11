import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export async function sendMessageToChatbot(message) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${SERVER_URL}/send_message`, { message }, {
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
