const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // In production, verify JWT token here
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes via app locals
app.set('io', io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, you can:`);
    console.error(`1. Kill the process using port ${PORT}:`);
    console.error(`   lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   OR`);
    console.error(`   kill -9 $(lsof -ti:${PORT})`);
    console.error(`\n2. Use a different port by setting PORT in .env file`);
    console.error(`   PORT=5001 npm run dev\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
