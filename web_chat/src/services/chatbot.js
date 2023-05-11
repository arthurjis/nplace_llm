import axios from 'axios';

// const SERVER_URL = 'http://127.0.0.1:5000/'; // Replace with your chatbot API endpoint
const SERVER_URL = "nplacellmflask-production.up.railway.app"

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
