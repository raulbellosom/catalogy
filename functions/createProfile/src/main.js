/**
 * createProfile - Appwrite Function
 *
 * Creates a profile document when a new user registers.
 * Triggered by users.*.create event.
 *
 * Runtime: Node.js 18
 * Trigger: Event (users.*.create)
 * Scopes: databases.write, users.read
 */

import { Client, Databases, ID } from "node-appwrite";

/** @typedef {{ req: any, res: any, log: Function, error: Function }} Context */

/**
 * Parse user name into firstName and lastName
 * @param {string | undefined} fullName
 * @returns {{ firstName: string, lastName: string }}
 */
function parseUserName(fullName) {
  if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
    return { firstName: "Usuario", lastName: "" };
  }

  const parts = fullName.trim().split(" ");
  const firstName = parts[0] || "Usuario";
  const lastName = parts.slice(1).join(" ") || "";

  return { firstName, lastName };
}

/**
 * @param {Context} context
 */
export default async ({ req, res, log, error }) => {
  try {
    // Get user data from event
    // Event payload is in req.body for event triggers
    let userData;
    try {
      userData = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      error("Failed to parse event payload");
      return res.json({ ok: false, message: "Invalid event payload" }, 400);
    }

    const userId = userData.$id;
    const email = userData.email;
    const name = userData.name;

    if (!userId || !email) {
      error("Missing required user data (id or email)");
      return res.json(
        { ok: false, message: "Missing required user data" },
        400,
      );
    }

    log(`Creating profile for user: ${userId} (${email})`);

    // Setup Appwrite client
    const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
    const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
    const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
    const profilesCollectionId =
      process.env.VITE_APPWRITE_COLLECTION_PROFILES_ID;
    const preferencesCollectionId =
      process.env.VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID;

    const apiKey =
      process.env.APPWRITE_FUNCTION_API_KEY ||
      process.env.APPWRITE_ADMIN_API_KEY;

    if (
      !endpoint ||
      !projectId ||
      !databaseId ||
      !profilesCollectionId ||
      !preferencesCollectionId ||
      !apiKey
    ) {
      error("Missing required environment variables");
      return res.json(
        { ok: false, message: "Server configuration error" },
        500,
      );
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);

    // Check if profile already exists (idempotency)
    try {
      await databases.getDocument(databaseId, profilesCollectionId, userId);
      log(`Profile already exists for user: ${userId}`);
      return res.json({
        ok: true,
        message: "Profile already exists",
        profileId: userId,
      });
    } catch (e) {
      // Document not found is expected, continue with creation
      if (e.code !== 404) {
        throw e;
      }
    }

    // Parse name
    const { firstName, lastName } = parseUserName(name);

    // Create profile document with userId as documentId (1:1 mirror)
    const profile = await databases.createDocument(
      databaseId,
      profilesCollectionId,
      userId, // documentId = userId
      {
        firstName,
        lastName,
        email,
        emailVerified: false,
        role: "user",
        enabled: true,
        active: true,
      },
    );

    log(`Profile created: ${profile.$id}`);

    // Create user preferences
    try {
      await databases.createDocument(
        databaseId,
        preferencesCollectionId,
        ID.unique(),
        {
          profileId: userId,
          theme: "system",
          locale: "es",
          enabled: true,
          flagsJson: "{}",
        },
      );
      log(`User preferences created for profile: ${userId}`);
    } catch (prefError) {
      // Log but don't fail - profile was already created
      error(`Failed to create preferences: ${prefError}`);
    }

    return res.json({
      ok: true,
      message: "Profile created successfully",
      profileId: userId,
    });
  } catch (e) {
    error(`Unhandled error: ${e}`);
    return res.json(
      {
        ok: false,
        message: "Error creating profile",
        error: String(e),
      },
      500,
    );
  }
};
