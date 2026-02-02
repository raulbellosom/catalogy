/**
 * Store Service
 * Handles all store-related operations with Appwrite
 */

import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTIONS,
  BUCKETS,
} from "@/shared/lib/appwrite";
import { Query, ID } from "appwrite";

/**
 * Slug validation regex
 * @type {RegExp}
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validate slug format
 * @param {string} slug
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateSlug(slug) {
  if (!slug || slug.trim() === "") {
    return { valid: false, error: "El slug es requerido" };
  }

  const trimmed = slug.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: "El slug debe tener al menos 3 caracteres" };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "El slug no puede exceder 50 caracteres" };
  }

  if (!SLUG_REGEX.test(trimmed)) {
    return {
      valid: false,
      error:
        "Solo minúsculas, números y guiones. No puede empezar/terminar con guión",
    };
  }

  return { valid: true };
}

/**
 * Check if slug is available
 * @param {string} slug
 * @param {string} [excludeStoreId] - Store ID to exclude from check (for updates)
 * @returns {Promise<boolean>}
 */
export async function isSlugAvailable(slug, excludeStoreId = null) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORES,
      [Query.equal("slug", slug), Query.equal("enabled", true)],
    );

    if (response.total === 0) return true;
    if (excludeStoreId && response.documents[0].$id === excludeStoreId)
      return true;

    return false;
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return false;
  }
}

/**
 * Get user's store
 * @param {string} profileId
 * @returns {Promise<Object|null>}
 */
export async function getUserStore(profileId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORES,
      [Query.equal("profileId", profileId), Query.equal("enabled", true)],
    );

    return response.documents[0] || null;
  } catch (error) {
    console.error("Error getting user store:", error);
    return null;
  }
}

/**
 * Get store by slug (public)
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getStoreBySlug(slug) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORES,
      [
        Query.equal("slug", slug),
        Query.equal("published", true),
        Query.equal("enabled", true),
      ],
    );

    return response.documents[0] || null;
  } catch (error) {
    console.error("Error getting store by slug:", error);
    return null;
  }
}

/**
 * Create store
 * @param {Object} data - Store data
 * @returns {Promise<Object>}
 */
export async function createStore(data) {
  const { slug, name, description, templateId, profileId } = data;

  // Validate slug
  const validation = validateSlug(slug);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check availability
  const available = await isSlugAvailable(slug);
  if (!available) {
    throw new Error("Este slug ya está en uso");
  }

  return await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.STORES,
    ID.unique(),
    {
      profileId,
      slug: slug.trim().toLowerCase(),
      name: name.trim(),
      description: description?.trim() || "",
      templateId: templateId || "minimal",
      published: false,
      enabled: true,
    },
  );
}

/**
 * Update store
 * @param {string} storeId
 * @param {Object} data - Store data to update
 * @returns {Promise<Object>}
 */
export async function updateStore(storeId, data) {
  const updateData = { ...data };

  // If slug is being updated, validate it
  if (data.slug) {
    const validation = validateSlug(data.slug);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const available = await isSlugAvailable(data.slug, storeId);
    if (!available) {
      throw new Error("Este slug ya está en uso");
    }

    updateData.slug = data.slug.trim().toLowerCase();
  }

  // Trim text fields
  if (data.name) updateData.name = data.name.trim();
  if (data.description) updateData.description = data.description.trim();

  return await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.STORES,
    storeId,
    updateData,
  );
}

/**
 * Upload store logo
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadStoreLogo(file) {
  return await storage.createFile(BUCKETS.STORE_LOGOS, ID.unique(), file);
}

/**
 * Delete store logo
 * @param {string} fileId
 * @returns {Promise<void>}
 */
export async function deleteStoreLogo(fileId) {
  try {
    await storage.deleteFile(BUCKETS.STORE_LOGOS, fileId);
  } catch (error) {
    console.error("Error deleting store logo:", error);
  }
}

/**
 * Get store logo URL
 * @param {string} fileId
 * @returns {string}
 */
export function getStoreLogoUrl(fileId) {
  if (!fileId) return null;
  return storage.getFileView(BUCKETS.STORE_LOGOS, fileId).href;
}

/**
 * Toggle store published status
 * @param {string} storeId
 * @param {boolean} published
 * @returns {Promise<Object>}
 */
export async function toggleStorePublished(storeId, published) {
  return await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.STORES,
    storeId,
    { published },
  );
}

/**
 * Delete store (soft delete)
 * @param {string} storeId
 * @returns {Promise<Object>}
 */
export async function deleteStore(storeId) {
  return await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.STORES,
    storeId,
    { enabled: false },
  );
}
