import { create } from "zustand";

/**
 * Global error store for handling application errors
 */
export const useErrorStore = create((set) => ({
  error: null,
  errorCode: null,
  errorMessage: null,

  // Set error
  setError: (code, message = null) => {
    set({ error: true, errorCode: code, errorMessage: message });
  },

  // Clear error
  clearError: () => {
    set({ error: null, errorCode: null, errorMessage: null });
  },

  // Helper methods for common errors
  setNotFound: (message) =>
    set({ error: true, errorCode: 404, errorMessage: message }),
  setForbidden: (message) =>
    set({ error: true, errorCode: 403, errorMessage: message }),
  setServerError: (message) =>
    set({ error: true, errorCode: 500, errorMessage: message }),
  setUnauthorized: (message) =>
    set({ error: true, errorCode: 401, errorMessage: message }),
}));
