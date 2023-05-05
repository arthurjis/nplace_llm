import { createContext } from 'react';
import socket from '../utils/socket';

const SocketContext = createContext(socket);

export default SocketContext;
