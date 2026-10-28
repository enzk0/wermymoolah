import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog } from 'electron';
import { startEmbeddedDb } from '../../server/src/embeddedDb.js';
import { initDb, closeDb } from '../../server/src/db.js';
import { migrate } from '../../server/src/schema.js';
import { createApp } from '../../server/src/app.js';

const clientDir = fileURLToPath(new URL('../../client/dist', import.meta.url));

let db = null;
let server = null;
let mainWindow = null;
let shuttingDown = false;

function log(...parts) {
  const timestamp = new Date().toISOString();
  const text = parts
    .map(String)
    .join(' ')
    .trimEnd()
    .split('\n')
    .map((line) => `${timestamp} ${line}\n`)
    .join('');
  process.stdout.write(text);
  try {
    const dir = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'main.log'), text);
  } catch {
    // Logging must never be the reason the app fails.
  }
}

function listen(expressApp) {
  return new Promise((resolve, reject) => {
    const httpServer = expressApp.listen(0, '127.0.0.1');
    httpServer.once('listening', () => resolve(httpServer));
    httpServer.once('error', reject);
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  return mainWindow.loadURL(`http://127.0.0.1:${port}/`);
}

async function start() {
  const dataDir = app.getPath('userData');
  log('[main] starting, data in', dataDir);

  db = await startEmbeddedDb({
    dataDir,
    onLog: (message) => log('[pg]', message),
    onError: (err) => log('[pg]', err),
  });
  await migrate(initDb(db.databaseUrl));
  log('[main] schema applied');

  server = await listen(createApp({ clientDir }));
  const { port } = server.address();
  log(`[main] api listening on http://127.0.0.1:${port}`);

  await createWindow(port);
}

async function shutdown() {
  if (server) {
    await new Promise((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
    server = null;
  }

  try {
    await closeDb();
  } catch (err) {
    log('[main] closing the pool failed:', err.stack ?? err);
  }

  if (db) {
    try {
      await db.stop();
      log('[main] postgres stopped');
    } catch (err) {
      log('[main] stopping postgres failed:', err.stack ?? err);
    }
    db = null;
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.on('before-quit', (event) => {
    event.preventDefault();
    if (shuttingDown) return;
    shuttingDown = true;
    log('[main] quitting');
    shutdown().finally(() => app.exit(0));
  });

  app.whenReady().then(() =>
    start().catch(async (err) => {
      log('[main] startup failed:', err.stack ?? err);
      dialog.showErrorBox('wermymoolah could not start', String(err?.message ?? err));
      shuttingDown = true;
      await shutdown();
      app.exit(1);
    }),
  );
}
