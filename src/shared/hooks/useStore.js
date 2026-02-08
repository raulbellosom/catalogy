/**
 * Custom hooks for store management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import { useProfile } from "./useProfile";
import {
  getUserStore,
  getStoreBySlug,
  createStore,
  updateStore,
  deleteStoreCompletely,
  uploadStoreLogo,
  deleteStoreLogo,
  toggleStorePublished,
  isSlugAvailable,
} from "@/shared/services/storeService";

/**
 * Hook to get current user's store
 * @returns {Object} Query result with store data
 */
export function useUserStore() {
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["store", "user", user?.$id],
    queryFn: () => getUserStore(user.$id),
    enabled: isAuthenticated && !!user?.$id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get store by slug (public)
 * @param {string} slug
 * @returns {Object} Query result with store data
 */
export function useStoreBySlug(slug) {
  return useQuery({
    queryKey: ["store", "slug", slug],
    queryFn: () => getStoreBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to check if slug is available
 * @param {string} slug
 * @param {string} [excludeStoreId]
 * @returns {Object} Query result with availability status
 */
export function useSlugAvailability(slug, excludeStoreId = null) {
  return useQuery({
    queryKey: ["slug-availability", slug, excludeStoreId],
    queryFn: () => isSlugAvailable(slug, excludeStoreId),
    enabled: !!slug && slug.length >= 3,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to create store
 * @returns {Object} Mutation object
 */
export function useCreateStore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) => createStore({ ...data, profileId: user.$id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "user", user.$id] });
    },
  });
}

/**
 * Hook to update store
 * @returns {Object} Mutation object
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ storeId, data }) => updateStore(storeId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store", "user", user.$id] });
      queryClient.invalidateQueries({ queryKey: ["store", "slug", data.slug] });
    },
  });
}

/**
 * Hook to delete store
 * @returns {Object} Mutation object
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ storeId, email, password }) =>
      deleteStoreCompletely({ storeId, email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "user", user.$id] });
      queryClient.removeQueries({ queryKey: ["store", "slug"] });
      queryClient.removeQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Hook to upload store logo
 * @returns {Object} Mutation object
 */
export function useUploadStoreLogo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: uploadStoreLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "user", user.$id] });
    },
  });
}

/**
 * Hook to toggle store published status
 * @returns {Object} Mutation object
 */
export function useToggleStorePublished() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ storeId, published }) =>
      toggleStorePublished(storeId, published),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store", "user", user.$id] });
      queryClient.invalidateQueries({ queryKey: ["store", "slug", data.slug] });
    },
  });
}
