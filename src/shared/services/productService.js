/**
 * Product Service
 * Handles all product-related operations with Appwrite
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
 * List products for a store
 * @param {string} storeId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function listProducts(storeId, options = {}) {
  const { includeDisabled = false } = options;

  const queries = [Query.equal("storeId", storeId)];

  if (!includeDisabled) {
    queries.push(Query.equal("enabled", true));
  }

  queries.push(Query.orderAsc("sortOrder"));

  return await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PRODUCTS,
    queries,
  );
}

/**
 * Get product by ID
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function getProduct(productId) {
  return await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.PRODUCTS,
    productId,
  );
}

/**
 * Create product
 * @param {Object} data - Product data
 * @returns {Promise<Object>}
 */
export async function createProduct(data) {
  const {
    storeId,
    name,
    description,
    price,
    currency,
    sortOrder,
    imageFileIds,
    stock,
    categoryIds,
  } = data;

  // Validate
  if (!name || name.trim().length < 3) {
    throw new Error("El nombre del producto debe tener al menos 3 caracteres");
  }

  if (price < 0) {
    throw new Error("El precio debe ser mayor o igual a 0");
  }

  return await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.PRODUCTS,
    ID.unique(),
    {
      storeId,
      name: name.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      currency: currency || "MXN",
      sortOrder: sortOrder || 0,
      imageFileIds: Array.isArray(imageFileIds) ? imageFileIds : [],
      stock: parseInt(stock) || 0,
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
      enabled: true,
    },
  );
}

/**
 * Update product
 * @param {string} productId
 * @param {Object} data - Product data to update
 * @returns {Promise<Object>}
 */
export async function updateProduct(productId, data) {
  const updateData = { ...data };

  // Validate name if provided
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error(
        "El nombre del producto debe tener al menos 3 caracteres",
      );
    }
    updateData.name = data.name.trim();
  }

  // Validate price if provided
  if (data.price !== undefined) {
    if (data.price < 0) {
      throw new Error("El precio debe ser mayor o igual a 0");
    }
    updateData.price = parseFloat(data.price);
  }

  // Trim description if provided
  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || "";
  }

  if (data.categoryIds !== undefined) {
    updateData.categoryIds = Array.isArray(data.categoryIds)
      ? data.categoryIds
      : [];
  }

  if (data.imageFileIds !== undefined) {
    updateData.imageFileIds = Array.isArray(data.imageFileIds)
      ? data.imageFileIds
      : [];
  }

  return await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PRODUCTS,
    productId,
    updateData,
  );
}

/**
 * Delete product (soft delete)
 * @param {string} productId
 * @returns {Promise<Object>}
 */
export async function deleteProduct(productId) {
  return await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PRODUCTS,
    productId,
    { enabled: false },
  );
}

/**
 * Upload product image
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadProductImage(file) {
  return await storage.createFile(BUCKETS.PRODUCT_IMAGES, ID.unique(), file);
}

/**
 * Delete product image
 * @param {string} fileId
 * @returns {Promise<void>}
 */
export async function deleteProductImage(fileId) {
  try {
    await storage.deleteFile(BUCKETS.PRODUCT_IMAGES, fileId);
  } catch (error) {
    console.error("Error deleting product image:", error);
  }
}

/**
 * Get product image URL
 * @param {string} fileId
 * @returns {string}
 */
export function getProductImageUrl(fileId) {
  if (!fileId) return null;
  return storage.getFileView(BUCKETS.PRODUCT_IMAGES, fileId).href;
}

/**
 * Get product image URLs from array of file IDs
 * @param {string[]} fileIds - Array of file IDs
 * @returns {string[]} Array of image URLs
 */
export function getProductImageUrls(fileIds) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return [];
  return fileIds.filter(Boolean).map((fileId) => getProductImageUrl(fileId));
}

/**
 * Delete multiple product images
 * @param {string[]} fileIds - Array of file IDs to delete
 * @returns {Promise<void>}
 */
export async function deleteProductImages(fileIds) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) return;

  const deletePromises = fileIds.filter(Boolean).map(async (fileId) => {
    try {
      await storage.deleteFile(BUCKETS.PRODUCT_IMAGES, fileId);
    } catch (error) {
      console.error(`Error deleting product image ${fileId}:`, error);
    }
  });

  await Promise.all(deletePromises);
}

/**
 * Reorder products
 * @param {string} storeId
 * @param {Array<{id: string, sortOrder: number}>} products
 * @returns {Promise<void>}
 */
export async function reorderProducts(storeId, products) {
  const promises = products.map((product) =>
    databases.updateDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, product.id, {
      sortOrder: product.sortOrder,
    }),
  );

  await Promise.all(promises);
}
