import { env } from '$env/dynamic/private';

// Database Configuration
export const DB_PATH = env.DB_PATH || 'src/lib/database/jkuis.db';

// API Configuration
export const API_URL = env.API_URL || 'http://localhost:5173';

// Environment
export const NODE_ENV = env.NODE_ENV || 'development'; 