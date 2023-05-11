import axios from 'axios';

// const SERVER_URL = 'http://127.0.0.1:5000/'; // Replace with your chatbot API endpoint
// const SERVER_URL = "https://nplacellmflask-production.up.railway.app"
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export async function sendMessageToChatbot(message) {
  try {
    const response = await axios.post(`${SERVER_URL}/send_message`, {
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    return null;
  }
}
