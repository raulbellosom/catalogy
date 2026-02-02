import { Client, Account, Databases, Storage } from "appwrite";

/**
 * Appwrite client configuration
 * Uses environment variables from .env
 */

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

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

// Database and collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "main";

export const COLLECTIONS = {
  PROFILES: import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES_ID || "profiles",
  USER_PREFERENCES:
    import.meta.env.VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID ||
    "userPreferences",
  STORES: import.meta.env.VITE_APPWRITE_COLLECTION_STORES_ID || "stores",
  PRODUCTS: import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTS_ID || "products",
};

export const BUCKETS = {
  AVATARS: import.meta.env.VITE_APPWRITE_BUCKET_AVATARS_ID || "avatars",
  PRODUCT_IMAGES:
    import.meta.env.VITE_APPWRITE_BUCKET_PRODUCT_IMAGES_ID || "productImages",
  STORE_LOGOS:
    import.meta.env.VITE_APPWRITE_BUCKET_STORE_LOGOS_ID || "storeLogos",
};

// App configuration
export const APP_CONFIG = {
  BASE_DOMAIN: import.meta.env.VITE_APP_BASE_DOMAIN || "catalog.racoondevs.com",
};
