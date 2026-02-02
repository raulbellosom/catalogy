/**
 * Centralized Environment Configuration
 *
 * Este archivo centraliza todas las variables de entorno del proyecto.
 * Provee validación, valores por defecto y tipado de configuración.
 *
 * Uso:
 * import { appwriteConfig, collections, buckets, functions } from '@/shared/lib/env';
 */

// ============================================================
// Helper Functions
// ============================================================

/**
 * Obtiene una variable de entorno con validación
 * @param {string} key - Nombre de la variable de entorno
 * @param {string} [defaultValue] - Valor por defecto
 * @param {boolean} [required=false] - Si es requerida
 * @returns {string}
 */
function getEnvVar(key, defaultValue = "", required = false) {
  const value = import.meta.env[key] || defaultValue;

  if (required && !value) {
    console.error(`❌ Variable de entorno requerida faltante: ${key}`);
  }

  return value;
}

// ============================================================
// Core Appwrite Configuration
// ============================================================

export const appwriteConfig = {
  endpoint: getEnvVar("VITE_APPWRITE_ENDPOINT", "", true),
  projectId: getEnvVar("VITE_APPWRITE_PROJECT_ID", "", true),
  projectName: getEnvVar("VITE_APPWRITE_PROJECT_NAME", "catalogy"),
  databaseId: getEnvVar("VITE_APPWRITE_DATABASE_ID", "main", true),
};

// ============================================================
// Collections
// ============================================================

export const collections = {
  profiles: getEnvVar("VITE_APPWRITE_COLLECTION_PROFILES_ID", "profiles", true),
  userPreferences: getEnvVar(
    "VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID",
    "userPreferences",
    true,
  ),
  emailVerifications: getEnvVar(
    "VITE_APPWRITE_COLLECTION_EMAIL_VERIFICATIONS_ID",
    "emailVerifications",
    true,
  ),
  stores: getEnvVar("VITE_APPWRITE_COLLECTION_STORES_ID", "stores", true),
  products: getEnvVar("VITE_APPWRITE_COLLECTION_PRODUCTS_ID", "products", true),
};

// Alias legacy para compatibilidad
export const COLLECTIONS = collections;

// ============================================================
// Storage Buckets
// ============================================================

export const buckets = {
  avatars: getEnvVar("VITE_APPWRITE_BUCKET_AVATARS_ID", "avatars", true),
  productImages: getEnvVar(
    "VITE_APPWRITE_BUCKET_PRODUCT_IMAGES_ID",
    "productImages",
    true,
  ),
  storeLogos: getEnvVar(
    "VITE_APPWRITE_BUCKET_STORE_LOGOS_ID",
    "storeLogos",
    true,
  ),
};

// Alias legacy para compatibilidad
export const BUCKETS = buckets;

// ============================================================
// Appwrite Functions
// ============================================================

export const functions = {
  emailVerification: getEnvVar(
    "VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID",
    "",
    true,
  ),
  onUserCreated: getEnvVar(
    "VITE_APPWRITE_FUNCTION_ON_USER_CREATED_ID",
    "",
    true,
  ),
  syncUserProfile: getEnvVar(
    "VITE_APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID",
    "",
    true,
  ),
  validateSlug: getEnvVar("VITE_APPWRITE_FUNCTION_VALIDATE_SLUG_ID", ""),
};

// ============================================================
// App Configuration
// ============================================================

export const appConfig = {
  baseDomain: getEnvVar(
    "VITE_APP_BASE_DOMAIN",
    "catalogy.site.racoondevs.com",
    true,
  ),
  baseUrl: getEnvVar(
    "VITE_APP_BASE_URL",
    "https://catalogy.site.racoondevs.com",
    true,
  ),
};

// Alias legacy para compatibilidad
export const APP_CONFIG = appConfig;

// ============================================================
// Database ID (legacy export)
// ============================================================

export const DATABASE_ID = appwriteConfig.databaseId;

// ============================================================
// Validation
// ============================================================

/**
 * Valida que toda la configuración crítica esté presente
 * @returns {boolean}
 */
export function validateConfig() {
  const errors = [];

  // Core Appwrite
  if (!appwriteConfig.endpoint) errors.push("VITE_APPWRITE_ENDPOINT");
  if (!appwriteConfig.projectId) errors.push("VITE_APPWRITE_PROJECT_ID");
  if (!appwriteConfig.databaseId) errors.push("VITE_APPWRITE_DATABASE_ID");

  // Collections
  if (!collections.profiles)
    errors.push("VITE_APPWRITE_COLLECTION_PROFILES_ID");
  if (!collections.userPreferences)
    errors.push("VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID");
  if (!collections.stores) errors.push("VITE_APPWRITE_COLLECTION_STORES_ID");
  if (!collections.products)
    errors.push("VITE_APPWRITE_COLLECTION_PRODUCTS_ID");

  // Buckets
  if (!buckets.avatars) errors.push("VITE_APPWRITE_BUCKET_AVATARS_ID");
  if (!buckets.productImages)
    errors.push("VITE_APPWRITE_BUCKET_PRODUCT_IMAGES_ID");
  if (!buckets.storeLogos) errors.push("VITE_APPWRITE_BUCKET_STORE_LOGOS_ID");

  // Functions críticas
  if (!functions.emailVerification)
    errors.push("VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID");
  if (!functions.onUserCreated)
    errors.push("VITE_APPWRITE_FUNCTION_ON_USER_CREATED_ID");
  if (!functions.syncUserProfile)
    errors.push("VITE_APPWRITE_FUNCTION_SYNC_USER_PROFILE_ID");

  // App config
  if (!appConfig.baseDomain) errors.push("VITE_APP_BASE_DOMAIN");
  if (!appConfig.baseUrl) errors.push("VITE_APP_BASE_URL");

  if (errors.length > 0) {
    console.error("❌ Variables de entorno faltantes:", errors);
    return false;
  }

  console.log("✅ Configuración de entorno validada correctamente");
  return true;
}

// ============================================================
// Export Default
// ============================================================

export default {
  appwriteConfig,
  collections,
  buckets,
  functions,
  appConfig,
  validateConfig,
  // Legacy exports
  COLLECTIONS,
  BUCKETS,
  APP_CONFIG,
  DATABASE_ID,
};
