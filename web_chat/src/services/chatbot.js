import axios from 'axios';

const chatbotAPI = 'https://api.example.com/chatbot'; // Replace with your chatbot API endpoint

export async function sendMessageToChatbot(message) {
  try {
    const response = await axios.post(chatbotAPI, {
      message: message,
    });

    return response.data;
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    return null;
  }
}
