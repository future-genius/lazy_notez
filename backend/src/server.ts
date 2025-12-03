import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './utils/socket';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`LazyNotez backend running on port ${PORT}`);
});
