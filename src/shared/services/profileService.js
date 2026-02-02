/**
 * Profile Service
 * Handles all profile-related operations with Appwrite
 */

import { databases, DATABASE_ID, COLLECTIONS } from "@/shared/lib/appwrite";

/**
 * Get user profile by user ID
 * @param {string} userId - Auth user ID
 * @returns {Promise<Object>} Profile document
 */
export async function getProfile(userId) {
  return await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId);
}

/**
 * Check if user has admin role
 * @param {string} userId - Auth user ID
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId) {
  try {
    const profile = await getProfile(userId);
    return profile.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Update profile
 * @param {string} userId - Auth user ID
 * @param {Object} data - Profile data to update
 * @returns {Promise<Object>} Updated profile document
 */
export async function updateProfile(userId, data) {
  return await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PROFILES,
    userId,
    data,
  );
}

/**
 * List all profiles (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of profiles
 */
export async function listProfiles(options = {}) {
  const { limit = 25, offset = 0, search = "" } = options;

  const queries = [];

  if (search) {
    // Note: In production, you might want to use search indexes
    // For now, we'll fetch all and filter client-side
  }

  return await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PROFILES,
    queries,
  );
}
