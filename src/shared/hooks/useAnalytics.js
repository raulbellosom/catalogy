/**
 * Custom hooks for store analytics
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  trackStoreView,
  getStoreAnalytics,
  getTodayAnalytics,
} from "@/shared/services/analyticsService";

/**
 * Hook to track a store view
 * @returns {Object} Mutation object
 */
export function useTrackVisit() {
  return useMutation({
    mutationFn: (storeId) => trackStoreView(storeId),
    // Don't retry on failure - analytics shouldn't slow down the app
    retry: false,
  });
}

/**
 * Hook to get store analytics for last N days
 * @param {string} storeId
 * @param {number} [days=7]
 * @returns {Object} Query result with analytics data
 */
export function useStoreAnalytics(storeId, days = 7) {
  return useQuery({
    queryKey: ["analytics", storeId, days],
    queryFn: () => getStoreAnalytics(storeId, days),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get today's analytics for a store
 * @param {string} storeId
 * @returns {Object} Query result with today's analytics
 */
export function useTodayAnalytics(storeId) {
  return useQuery({
    queryKey: ["analytics", storeId, "today"],
    queryFn: () => getTodayAnalytics(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: true,
  });
}
