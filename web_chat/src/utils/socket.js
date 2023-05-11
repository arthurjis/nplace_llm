import { io } from 'socket.io-client';

const socket = io('https://nplacellm-production.up.railway.app');

export default socket;