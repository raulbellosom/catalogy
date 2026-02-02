import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/shared/lib/appwrite";

/**
 * @typedef {Object} User
 * @property {string} $id
 * @property {string} email
 * @property {string} name
 * @property {boolean} emailVerification
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User | null} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {() => Promise<void>} refreshUser
 * @property {() => Promise<void>} logout
 */

const AuthContext = createContext(
  /** @type {AuthContextValue | null} */ (null),
);

/**
 * Auth provider component
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {User | null} */ (null));
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch current user session
   */
  const refreshUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  /**
   * Logout user and clear session
   */
  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
