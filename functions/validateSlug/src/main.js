/**
 * validateSlug - Appwrite Function
 *
 * Validates that a slug is unique and URL-safe.
 *
 * Runtime: Node.js 18
 * Trigger: Manual (HTTP)
 * Scopes: databases.read
 */

import { Client, Databases, Query } from "node-appwrite";

/** @typedef {{ req: any, res: any, log: Function, error: Function }} Context */

/**
 * Slug validation regex
 * - 3-50 characters
 * - Lowercase alphanumeric and hyphens
 * - Cannot start or end with hyphen
 * - No consecutive hyphens
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 50;

/**
 * Validates slug format
 * @param {string} slug
 * @returns {{ valid: boolean, reason?: string, message?: string }}
 */
function validateSlugFormat(slug) {
  if (!slug || typeof slug !== "string") {
    return {
      valid: false,
      reason: "empty",
      message: "El slug es requerido",
    };
  }

  const trimmed = slug.trim().toLowerCase();

  if (trimmed.length < MIN_LENGTH) {
    return {
      valid: false,
      reason: "too_short",
      message: `El slug debe tener al menos ${MIN_LENGTH} caracteres`,
    };
  }

  if (trimmed.length > MAX_LENGTH) {
    return {
      valid: false,
      reason: "too_long",
      message: `El slug no puede exceder ${MAX_LENGTH} caracteres`,
    };
  }

  if (!SLUG_REGEX.test(trimmed)) {
    return {
      valid: false,
      reason: "format",
      message:
        "El slug solo puede contener letras minusculas, numeros y guiones (no al inicio ni al final)",
    };
  }

  return { valid: true };
}

/**
 * @param {Context} context
 */
export default async ({ req, res, log, error }) => {
  try {
    // Parse request body
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.json(
        {
          ok: false,
          message: "Invalid JSON body",
        },
        400,
      );
    }

    const { slug } = body || {};

    log(`Validating slug: ${slug}`);

    // Validate format first
    const formatValidation = validateSlugFormat(slug);
    if (!formatValidation.valid) {
      log(`Slug format invalid: ${formatValidation.reason}`);
      return res.json({
        ok: true,
        valid: false,
        slug,
        reason: formatValidation.reason,
        message: formatValidation.message,
      });
    }

    const normalizedSlug = slug.trim().toLowerCase();

    // Setup Appwrite client
    const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
    const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
    const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
    const storesCollectionId = process.env.VITE_APPWRITE_COLLECTION_STORES_ID;

    const apiKey =
      process.env.APPWRITE_FUNCTION_API_KEY ||
      process.env.APPWRITE_ADMIN_API_KEY;

    if (
      !endpoint ||
      !projectId ||
      !databaseId ||
      !storesCollectionId ||
      !apiKey
    ) {
      error("Missing required environment variables");
      return res.json(
        {
          ok: false,
          message: "Server configuration error",
        },
        500,
      );
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);

    // Check if slug is already in use
    const existingStores = await databases.listDocuments(
      databaseId,
      storesCollectionId,
      [
        Query.equal("slug", normalizedSlug),
        Query.equal("enabled", true),
        Query.limit(1),
      ],
    );

    if (existingStores.total > 0) {
      log(`Slug already taken: ${normalizedSlug}`);
      return res.json({
        ok: true,
        valid: false,
        slug: normalizedSlug,
        reason: "taken",
        message: "Este slug ya esta en uso",
      });
    }

    log(`Slug is valid and available: ${normalizedSlug}`);
    return res.json({
      ok: true,
      valid: true,
      slug: normalizedSlug,
    });
  } catch (e) {
    error(`Unhandled error: ${e}`);
    return res.json(
      {
        ok: false,
        message: "Error validating slug",
        error: String(e),
      },
      500,
    );
  }
};
