import axios from 'axios';

const SERVER_URL = 'http://127.0.0.1:8000'; // Replace with your chatbot API endpoint

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
