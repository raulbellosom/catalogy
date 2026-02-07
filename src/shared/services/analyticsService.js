/**
 * Analytics Service
 * Handles store analytics operations with Appwrite
 */

import { databases, DATABASE_ID, COLLECTIONS } from "@/shared/lib/appwrite";
import { Query, ID } from "appwrite";

/**
 * Generate a browser fingerprint hash for unique visitor detection
 * Based on navigator properties (no cookies/storage needed)
 * @returns {string} Hash string
 */
export function generateFingerprint() {
  const data = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
  ].join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string}
 */
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Track a store view
 * @param {string} storeId - Store ID
 * @param {string} [fingerprint] - Browser fingerprint (auto-generated if not provided)
 * @returns {Promise<Object>}
 */
export async function trackStoreView(storeId, fingerprint = null) {
  if (!storeId) {
    throw new Error("storeId is required");
  }

  const fp = fingerprint || generateFingerprint();
  const date = getTodayDate();

  try {
    // Try to find existing analytics record for today
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORE_ANALYTICS,
      [Query.equal("storeId", storeId), Query.equal("date", date)],
    );

    if (existing.documents.length > 0) {
      // Update existing record
      const doc = existing.documents[0];
      let fingerprints = [];

      try {
        fingerprints = JSON.parse(doc.fingerprints || "[]");
      } catch {
        fingerprints = [];
      }

      const isUnique = !fingerprints.includes(fp);

      // Add fingerprint if unique (limit array size to prevent overflow)
      if (isUnique && fingerprints.length < 5000) {
        fingerprints.push(fp);
      }

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.STORE_ANALYTICS,
        doc.$id,
        {
          totalViews: doc.totalViews + 1,
          uniqueViews: isUnique ? doc.uniqueViews + 1 : doc.uniqueViews,
          fingerprints: JSON.stringify(fingerprints),
        },
      );
    } else {
      // Create new record for today
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.STORE_ANALYTICS,
        ID.unique(),
        {
          storeId,
          date,
          totalViews: 1,
          uniqueViews: 1,
          fingerprints: JSON.stringify([fp]),
        },
      );
    }
  } catch (error) {
    console.error("Error tracking store view:", error);
    // Don't throw - analytics failures shouldn't break the app
    return null;
  }
}

/**
 * Get analytics for a store
 * @param {string} storeId - Store ID
 * @param {number} [days=7] - Number of days to fetch
 * @returns {Promise<Object>}
 */
export async function getStoreAnalytics(storeId, days = 7) {
  if (!storeId) {
    throw new Error("storeId is required");
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORE_ANALYTICS,
      [
        Query.equal("storeId", storeId),
        Query.greaterThanEqual("date", startDateStr),
        Query.lessThanEqual("date", endDateStr),
        Query.orderDesc("date"),
      ],
    );

    return {
      documents: result.documents,
      summary: {
        totalViews: result.documents.reduce((sum, d) => sum + d.totalViews, 0),
        uniqueViews: result.documents.reduce(
          (sum, d) => sum + d.uniqueViews,
          0,
        ),
        daysWithData: result.documents.length,
      },
    };
  } catch (error) {
    console.error("Error fetching store analytics:", error);
    return {
      documents: [],
      summary: {
        totalViews: 0,
        uniqueViews: 0,
        daysWithData: 0,
      },
    };
  }
}

/**
 * Get today's analytics for a store
 * @param {string} storeId - Store ID
 * @returns {Promise<Object>}
 */
export async function getTodayAnalytics(storeId) {
  if (!storeId) {
    return { totalViews: 0, uniqueViews: 0 };
  }

  const date = getTodayDate();

  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STORE_ANALYTICS,
      [Query.equal("storeId", storeId), Query.equal("date", date)],
    );

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      return {
        totalViews: doc.totalViews,
        uniqueViews: doc.uniqueViews,
      };
    }

    return { totalViews: 0, uniqueViews: 0 };
  } catch (error) {
    console.error("Error fetching today's analytics:", error);
    return { totalViews: 0, uniqueViews: 0 };
  }
}
