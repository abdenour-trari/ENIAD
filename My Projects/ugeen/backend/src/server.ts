import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import config from './config';
import automationRoutes from './routes/automation';
import { logger } from './services/loggerService';
import { database } from './services/databaseService';

const app = express();
const server = http.createServer(app);

// ─── Middleware ───
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// ─── API Routes ───
app.use('/api/automation', automationRoutes);

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── WebSocket Server ───
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    payload: { message: 'Connected to UGeen Automation Server' },
  }));

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

// Attach WebSocket server to logger for broadcasting
logger.setWSServer(wss);

// ─── Initialize Database ───
database.init();

// ─── Start Server ───
server.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        UGeen Automation Server           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  🌐 HTTP:  http://localhost:${config.port}         ║`);
  console.log(`║  🔌 WS:    ws://localhost:${config.port}/ws        ║`);
  console.log(`║  📁 DB:    ${config.databasePath.substring(0, 28).padEnd(28)}║`);
  console.log(`║  👁️  Head:  ${config.headless ? 'headless' : 'visible '}                    ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

// ─── Graceful Shutdown ───
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  database.close();
  wss.close();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  database.close();
  wss.close();
  server.close();
  process.exit(0);
});

export default app;
