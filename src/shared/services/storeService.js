/**
 * Store Service
 * Handles all store-related operations with Appwrite
 */

import {
  account,
  databases,
  storage,
  DATABASE_ID,
  COLLECTIONS,
  BUCKETS,
} from "@/shared/lib/appwrite";
import { Query, ID } from "appwrite";
import {
  validateSlugRemote,
  validateSlugFormat,
  generateSlug,
} from "./slugValidationService";
import { deleteProductImages } from "./productService";

// Re-export for backward compatibility
export { validateSlugFormat as validateSlug, generateSlug };

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
      [Query.equal("slug", slug), Query.equal("enabled", true)],
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
  const {
    slug,
    name,
    description,
    templateId,
    profileId,
    logoFileId,
    activeRenderer,
    categoriesJson,
    purchaseInstructions,
    paymentLink,
  } = data;

  // Validate slug using Appwrite function (format + availability)
  const validation = await validateSlugRemote(slug);
  if (!validation.valid) {
    throw new Error(validation.error || "Slug inválido");
  }

  // Use the normalized slug from validation
  return await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.STORES,
    ID.unique(),
    {
      profileId,
      slug: validation.slug, // Slug normalizado por la validación
      name: name.trim(),
      description: description?.trim() || "",
      logoFileId: logoFileId || null,
      templateId: templateId || "minimal",
      activeRenderer: activeRenderer || "template",
      categoriesJson: categoriesJson || "[]",
      purchaseInstructions: purchaseInstructions?.trim() || "",
      paymentLink: paymentLink?.trim() || null,
      settings: data.settings ? JSON.stringify(data.settings) : "{}",
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

  // If slug is being updated, check if it's different from current one
  if (data.slug) {
    try {
      const currentStore = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.STORES,
        storeId,
      );

      // Only validate if slug is actually changing
      if (currentStore.slug !== data.slug.toLowerCase().trim()) {
        const validation = await validateSlugRemote(data.slug);
        if (!validation.valid) {
          throw new Error(validation.error || "Slug inválido");
        }
        updateData.slug = validation.slug;
      } else {
        // If it's the same, just remove it from updateData or use the normalized version
        delete updateData.slug;
      }
    } catch (e) {
      if (e.message.includes("Slug")) throw e;
      console.warn("Could not fetch current store for slug validation skip", e);
    }
  }

  // Trim text fields
  if (data.name) updateData.name = data.name.trim();
  if (data.description) updateData.description = data.description.trim();
  if (data.purchaseInstructions !== undefined) {
    updateData.purchaseInstructions = data.purchaseInstructions?.trim() || "";
  }
  if (data.paymentLink !== undefined) {
    updateData.paymentLink = data.paymentLink?.trim() || null;
  }
  if (data.settings) updateData.settings = JSON.stringify(data.settings);
  if (data.categoriesJson !== undefined) {
    updateData.categoriesJson = data.categoriesJson || "[]";
  }

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

async function listAllDocuments(collectionId, queries = [], limit = 100) {
  const allDocuments = [];
  let cursor = null;

  while (true) {
    const response = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [
        ...queries,
        Query.limit(limit),
        cursor ? Query.cursorAfter(cursor) : null,
      ].filter(Boolean),
    );

    allDocuments.push(...response.documents);

    if (response.documents.length < limit) break;
    cursor = response.documents[response.documents.length - 1].$id;
  }

  return allDocuments;
}

async function performStoreHardDelete(storeId) {
  if (!storeId) {
    throw new Error("storeId is required for deletion");
  }

  // Fetch store to capture assets before deletion
  let store;
  try {
    store = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.STORES,
      storeId,
    );
  } catch (error) {
    console.error("Store not found for hard delete:", error);
    throw new Error("No se encontró la tienda para eliminar.");
  }

  // Collect all products (including disabled/inactive)
  const products = await listAllDocuments(COLLECTIONS.PRODUCTS, [
    Query.equal("storeId", storeId),
  ]);

  // Collect and delete product images
  const imageIds = new Set();
  products.forEach((product) => {
    if (Array.isArray(product.imageFileIds)) {
      product.imageFileIds.forEach((id) => id && imageIds.add(id));
    } else if (product.imageFileId) {
      imageIds.add(product.imageFileId);
    }
  });

  if (imageIds.size > 0) {
    await deleteProductImages([...imageIds]);
  }

  // Delete product documents
  for (const product of products) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.PRODUCTS,
        product.$id,
      );
    } catch (error) {
      console.error(`Error deleting product ${product.$id}:`, error);
    }
  }

  // Delete analytics/metrics
  const analyticsDocs = await listAllDocuments(COLLECTIONS.STORE_ANALYTICS, [
    Query.equal("storeId", storeId),
  ]);

  for (const doc of analyticsDocs) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.STORE_ANALYTICS,
        doc.$id,
      );
    } catch (error) {
      console.error(`Error deleting analytics doc ${doc.$id}:`, error);
    }
  }

  // Delete store logo if present
  if (store?.logoFileId) {
    await deleteStoreLogo(store.logoFileId);
  }

  // Finally delete the store document
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.STORES, storeId);

  return {
    productsDeleted: products.length,
    productImagesDeleted: imageIds.size,
    analyticsDeleted: analyticsDocs.length,
    storeDeleted: true,
  };
}

/**
 * Delete store permanently (products, images, analytics, store)
 * Optionally re-authenticates user with password before deletion.
 * @param {{ storeId: string, email?: string, password?: string }} params
 * @returns {Promise<Object>}
 */
export async function deleteStoreCompletely({ storeId, email, password }) {
  if (password && !email) {
    throw new Error("Email is required when providing password");
  }

  // Optional re-auth before destructive action
  if (password && email) {
    const session = await account.createEmailPasswordSession(email, password);
    try {
      return await performStoreHardDelete(storeId);
    } finally {
      if (session?.$id) {
        // Remove the temporary session to avoid duplicates
        account.deleteSession(session.$id).catch(() => {});
      }
    }
  }

  return await performStoreHardDelete(storeId);
}
