import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logger = pino({ level: 'info' });

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  // WhatsApp Session Management
  const authFolder = path.join(process.cwd(), 'auth_info_baileys');
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder);
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  let sock: any = null;

  const connectToWhatsApp = async () => {
    sock = makeWASocket({
      version,
      logger,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const qrBase64 = await qrcode.toDataURL(qr);
        io.emit('whatsapp:qr', qrBase64);
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
        io.emit('whatsapp:status', 'disconnected');
        if (shouldReconnect) {
          connectToWhatsApp();
        }
      } else if (connection === 'open') {
        console.log('Opened connection');
        io.emit('whatsapp:status', 'connected');
      }
    });

    sock.ev.on('messages.upsert', async (m: any) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            // Relay incoming message to frontend for storage
            io.emit('whatsapp:message', {
              sender: msg.pushName || msg.key.remoteJid,
              content: msg.message.conversation || msg.message.extendedTextMessage?.text || '[Media/Other]',
              timestamp: msg.messageTimestamp * 1000,
              jid: msg.key.remoteJid
            });
          }
        }
      }
    });
  };

  // Initial connection attempt
  connectToWhatsApp();

  // Socket.io Handlers
  io.on('connection', (socket) => {
    console.log('Client connected to socket');
    
    // Send current status on connect
    if (sock?.user) {
      socket.emit('whatsapp:status', 'connected');
    } else {
      socket.emit('whatsapp:status', 'disconnected');
    }

    socket.on('whatsapp:reconnect', () => {
      connectToWhatsApp();
    });

    socket.on('whatsapp:logout', async () => {
      if (sock) {
        await sock.logout();
        fs.rmSync(authFolder, { recursive: true, force: true });
        io.emit('whatsapp:status', 'disconnected');
        connectToWhatsApp();
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
