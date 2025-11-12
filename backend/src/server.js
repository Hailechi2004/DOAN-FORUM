require('dotenv').config();
const App = require('./app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function start() {
  try {
    // Create app instance
    const appInstance = new App();
    const server = appInstance.getServer();

    // Start server
    server.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
      console.log(`📊 API Endpoints: http://localhost:${PORT}/api`);
      console.log('=================================');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
