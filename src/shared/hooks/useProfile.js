/**
 * Custom hook for managing user profile
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import {
  getProfile,
  updateProfile,
  isAdmin,
} from "@/shared/services/profileService";

/**
 * Hook to get current user's profile
 * @returns {Object} Query result with profile data
 */
export function useProfile() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.$id],
    queryFn: () => getProfile(user.$id),
    enabled: isAuthenticated && !!user?.$id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to check if current user is admin
 * @returns {Object} Query result with admin status
 */
export function useIsAdmin() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["isAdmin", user?.$id],
    queryFn: () => isAdmin(user.$id),
    enabled: isAuthenticated && !!user?.$id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to update user profile
 * @returns {Object} Mutation object
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateProfile(user.$id, data),
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ["profile", user.$id] });
    },
  });
}
