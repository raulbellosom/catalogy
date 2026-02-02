/**
 * Appwrite Function entrypoint.
 * Runtime: Node.js
 *
 * Notes:
 * - Prefer APPWRITE_FUNCTION_API_KEY (dynamic key) in production.
 * - Never log secrets.
 */

/** @typedef {{ req: any, res: any, log: Function, error: Function }} Context */

import { Client, Databases, Storage, Users } from "node-appwrite";

/**
 * @param {Context} context
 */
export default async ({ req, res, log, error }) => {
  try {
    const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
    const projectId = process.env.VITE_APPWRITE_PROJECT_ID;

    // Prefer dynamic key if present, fallback to admin key for local dev
    const apiKey =
      process.env.APPWRITE_FUNCTION_API_KEY ||
      process.env.APPWRITE_ADMIN_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
      return res.json(
        {
          ok: false,
          message:
            "Missing required environment variables. Check .env.example and Appwrite Function variables.",
        },
        500,
      );
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    // Optional services (use only what you need)
    const databases = new Databases(client);
    const storage = new Storage(client);
    const users = new Users(client);

    // Example response
    return res.json({
      ok: true,
      message: "Function template running",
      meta: {
        method: req.method,
        path: req.path,
      },
    });
  } catch (e) {
    error(e);
    return res.json(
      { ok: false, message: "Unhandled error", error: String(e) },
      500,
    );
  }
};
