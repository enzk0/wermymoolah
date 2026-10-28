import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

const HOST = '127.0.0.1';
const USER = 'moolah';
const DATABASE = 'moolah';

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, HOST, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function loadOrCreateCredentials(file, clusterExists) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  if (clusterExists) {
    throw new Error(`${file} is missing, so the existing database cannot be opened.`);
  }

  const credentials = { user: USER, password: crypto.randomBytes(24).toString('hex') };
  await fs.writeFile(file, JSON.stringify(credentials, null, 2), { mode: 0o600 });
  return credentials;
}

async function ensureDatabase(cluster) {
  const client = cluster.getPgClient('postgres', HOST);
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      DATABASE,
    ]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE ${client.escapeIdentifier(DATABASE)}`);
    }
  } finally {
    await client.end();
  }
}

export async function startEmbeddedDb({ dataDir, onLog = console.log, onError = console.error }) {
  const clusterDir = path.join(dataDir, 'pgdata');
  const credentialsFile = path.join(dataDir, 'credentials.json');

  await fs.mkdir(dataDir, { recursive: true });

  const clusterExists = await fileExists(path.join(clusterDir, 'PG_VERSION'));
  const { user, password } = await loadOrCreateCredentials(credentialsFile, clusterExists);
  const port = await findFreePort();

  const cluster = new EmbeddedPostgres({
    databaseDir: clusterDir,
    port,
    user,
    password,
    authMethod: 'scram-sha-256',
    persistent: true,
    postgresFlags: ['-c', `listen_addresses=${HOST}`],
    onLog,
    onError,
  });

  if (!clusterExists) {
    // initdb refuses a non-empty directory, which is what an interrupted first run leaves.
    await fs.rm(clusterDir, { recursive: true, force: true });
    await cluster.initialise();
  }

  try {
    await cluster.start();
  } catch (err) {
    throw err ?? new Error('Postgres exited before it was ready to accept connections.');
  }

  try {
    await ensureDatabase(cluster);
  } catch (err) {
    await cluster.stop();
    throw err;
  }

  const databaseUrl =
    `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}` +
    `@${HOST}:${port}/${DATABASE}`;

  return { databaseUrl, stop: () => cluster.stop() };
}
