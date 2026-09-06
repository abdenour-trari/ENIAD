// dev-server.js
import http from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env file to support all Node versions without dotenv dependency
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn("Could not load .env file:", e);
}

const PORT = process.env.PORT || 5000;

// Request body parser helper
async function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // Add serverless express-like helper methods on res
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };

  req.body = await parseBody(req);

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Router matching Vercel Serverless Function file structures
  let handlerPath = null;
  if (pathname === '/api/chat' || pathname === '/api/chatbot/chat') {
    handlerPath = './api/chatbot/chat.js';
  } else if (pathname === '/api/courses' || pathname === '/api/courses/index') {
    handlerPath = './api/courses/index.js';
  } else if (pathname === '/api/housing' || pathname === '/api/housing/index' || pathname === '/api/annonces') {
    handlerPath = './api/housing/index.js';
  } else if (pathname === '/api/housing/drafts') {
    handlerPath = './api/housing/drafts.js';
  } else if (pathname === '/api/projects' || pathname === '/api/projects/index') {
    handlerPath = './api/projects/index.js';
  } else if (pathname === '/api/forum' || pathname === '/api/forum/index') {
    handlerPath = './api/forum/index.js';
  } else if (pathname === '/api/marketplace' || pathname === '/api/marketplace/index') {
    handlerPath = './api/marketplace/index.js';
  }

  if (handlerPath) {
    try {
      const modulePath = path.resolve(__dirname, handlerPath);
      const fileUrl = url.pathToFileURL(modulePath).toString();
      const { default: handler } = await import(fileUrl);
      await handler(req, res);
    } catch (err) {
      console.error(`Error in handler ${handlerPath}:`, err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
});

server.listen(PORT, () => {
  console.log(`\x1b[32m[API RUNNER]\x1b[0m Serverless dev runner listening on http://localhost:${PORT}`);
});
