import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  Query,
} from "appwrite";
import {
  appwriteConfig,
  collections,
  buckets,
  appConfig,
  DATABASE_ID,
  COLLECTIONS,
  BUCKETS,
  APP_CONFIG,
} from "./env";

/**
 * Appwrite client configuration
 * Uses centralized environment configuration from env.js
 */

const { endpoint, projectId } = appwriteConfig;

if (!endpoint || !projectId) {
  console.error("Missing Appwrite configuration. Check your .env file.");
}

export const client = new Client();

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export { Query };

// Re-export from env.js for backward compatibility
export { DATABASE_ID, COLLECTIONS, BUCKETS, APP_CONFIG };

// New exports (recommended)
export { appwriteConfig, collections, buckets, appConfig };
