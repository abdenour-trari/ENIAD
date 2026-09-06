import dotenv from 'dotenv';
import path from 'path';
import { AppConfig } from '../types';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`⚠ Environment variable ${key} is not set.`);
    return '';
  }
  return value;
}

export const config: AppConfig = {
  email: requireEnv('EMAIL'),
  password: requireEnv('PASSWORD'),
  downloadPath: path.resolve(__dirname, '../../../', process.env.DOWNLOAD_PATH || './downloads'),
  headless: process.env.HEADLESS === 'true',
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: path.resolve(__dirname, '../../../', process.env.DATABASE_PATH || './database/ugeen.db'),
};

export default config;
