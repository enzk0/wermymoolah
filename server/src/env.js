import 'dotenv/config';

export function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.',
    );
  }
  return process.env.DATABASE_URL;
}
