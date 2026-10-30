require('dotenv').config();
const http = require('http');
const app = require('./app');
const initializeDatabase = require('./scripts/init-db');

const PORT = process.env.PORT || 5000;

// Ensure database tables and sample data are ready
try {
  initializeDatabase();
} catch (error) {
  console.error('[DB] Database initialization error:', error);
}

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('================================================================');
  console.log('🏛️  MUNICIPAL COMPLAINT REGISTRATION PORTAL - BACKEND SERVER');
  console.log('================================================================');
  console.log(`📡 Backend API URL : http://localhost:${PORT}`);
  console.log(`🩺 Health Check    : http://localhost:${PORT}/api/health`);
  console.log(`📊 Complaint Stats : http://localhost:${PORT}/api/complaints/stats`);
  console.log('----------------------------------------------------------------');
  console.log('🔑 DEMONSTRATION ADMINISTRATOR CREDENTIALS:');
  console.log(`   Username : ${process.env.ADMIN_USERNAME || 'admin'}`);
  console.log(`   Password : ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('================================================================');
});

// Handle graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
