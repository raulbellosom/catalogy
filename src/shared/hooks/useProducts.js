/**
 * Custom hooks for product management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  reorderProducts,
} from "@/shared/services/productService";

/**
 * Hook to list products for a store
 * @param {string} storeId
 * @param {Object} options
 * @returns {Object} Query result with products list
 */
export function useProducts(storeId, options = {}) {
  return useQuery({
    queryKey: ["products", storeId, options],
    queryFn: () => listProducts(storeId, options),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get product by ID
 * @param {string} productId
 * @returns {Object} Query result with product data
 */
export function useProduct(productId) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create product
 * @param {string} storeId
 * @returns {Object} Mutation object
 */
export function useCreateProduct(storeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createProduct({ ...data, storeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
    },
  });
}

/**
 * Hook to update product
 * @param {string} storeId
 * @returns {Object} Mutation object
 */
export function useUpdateProduct(storeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }) => updateProduct(productId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
      queryClient.invalidateQueries({ queryKey: ["product", data.$id] });
    },
  });
}

/**
 * Hook to delete product
 * @param {string} storeId
 * @returns {Object} Mutation object
 */
export function useDeleteProduct(storeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
    },
  });
}

/**
 * Hook to upload product image
 * @returns {Object} Mutation object
 */
export function useUploadProductImage() {
  return useMutation({
    mutationFn: uploadProductImage,
  });
}

/**
 * Hook to reorder products
 * @param {string} storeId
 * @returns {Object} Mutation object
 */
export function useReorderProducts(storeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (products) => reorderProducts(storeId, products),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
    },
  });
}
