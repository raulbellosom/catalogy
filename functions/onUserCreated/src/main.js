import { Client, Databases, Users, Functions, ID, Query } from "node-appwrite";

/**
 * Catalogy — onUserCreated
 * Trigger: users.*.create
 *
 * Crea el documento espejo en `profiles` con DocID = Auth userId
 * y genera firstName/lastName a partir del `name` del usuario de Auth.
 *
 * Requiere API KEY (server) con permisos:
 * - users.read
 * - databases.write (para crear/actualizar documento)
 * - execution.write (para invocar emailVerification)
 */

function splitName(fullName) {
  const s = String(fullName || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!s) return { firstName: "Usuario", lastName: "" };
  const parts = s.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default async ({ req, res, log, error }) => {
  const client = new Client();
  const users = new Users(client);
  const db = new Databases(client);

  const endpoint =
    process.env.APPWRITE_FUNCTION_ENDPOINT ||
    process.env.VITE_APPWRITE_ENDPOINT;
  const projectId =
    process.env.APPWRITE_FUNCTION_PROJECT_ID ||
    process.env.VITE_APPWRITE_PROJECT_ID;
  const apiKey =
    process.env.APPWRITE_FUNCTION_API_KEY || process.env.APPWRITE_ADMIN_API_KEY;

  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || "main";
  const profilesCollectionId =
    process.env.VITE_APPWRITE_COLLECTION_PROFILES_ID || "profiles";

  if (!endpoint || !projectId || !apiKey) {
    error("Missing APPWRITE endpoint/projectId/apiKey env vars");
    return res.json({ success: false, message: "Server misconfigured" }, 500);
  }

  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

  // Parse event data
  let data = {};
  try {
    const raw = req.body ?? req.payload ?? "{}";
    data = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    error("Invalid event payload: " + e.message);
    return res.json({ success: false, message: "Invalid payload" }, 400);
  }

  // Appwrite user create event usually includes $id + name + email + phone, etc.
  const userId = data.$id || data.userId || data.id;
  if (!userId) {
    error("No userId in event payload");
    return res.json({ success: false, message: "No userId in payload" }, 400);
  }

  try {
    // Ensure user exists in Auth (extra safety)
    const authUser = await users.get(userId);

    const { firstName, lastName } = splitName(authUser.name);

    // Timestamp actual para aceptación de términos
    const now = new Date().toISOString();

    const doc = {
      firstName,
      lastName,
      email: authUser.email || `missing_${userId}@noemail.com`,
      emailVerified: false,
      phone: authUser.phone || "",
      phoneVerified: false,
      avatarFileId: "",
      role: "user",
      enabled: true,
      active: true,
      termsAcceptedAt: now,
      termsVersion: "1.0.0",
      privacyAcceptedAt: now,
    };

    // Create if not exists, else update (idempotent)
    let result;
    try {
      await db.getDocument(databaseId, profilesCollectionId, userId);
      await db.updateDocument(databaseId, profilesCollectionId, userId, doc);
      log(`profiles/${userId} updated`);
      result = { success: true, action: "updated", userId };
    } catch (e) {
      // If not found -> create
      await db.createDocument(databaseId, profilesCollectionId, userId, doc);
      log(`profiles/${userId} created`);
      result = { success: true, action: "created", userId };
    }

    // -----------------------------------------------------------------------
    // Create User Preferences (Default: Mexico/Spanish)
    // -----------------------------------------------------------------------
    const prefsCollectionId =
      process.env.VITE_APPWRITE_COLLECTION_USER_PREFERENCES_ID ||
      "userPreferences";
    try {
      // Check if exists first to be safe (idempotent)
      await db.getDocument(databaseId, prefsCollectionId, userId);
      log(`userPreferences/${userId} already exists`);
    } catch (e) {
      // If not found, create
      await db.createDocument(databaseId, prefsCollectionId, userId, {
        profileId: userId,
        theme: "system",
        locale: "es",
        enabled: true,
        flagsJson: JSON.stringify({}),
      });
      log(`userPreferences/${userId} created`);
    }

    // -----------------------------------------------------------------------
    // Trigger Email Verification
    // -----------------------------------------------------------------------
    const verificationFunctionId =
      process.env.VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID;
    if (verificationFunctionId) {
      try {
        const functions = new Functions(client);
        await functions.createExecution(
          verificationFunctionId,
          JSON.stringify({
            action: "send",
            userAuthId: userId,
            email: authUser.email,
          }),
          true, // async (fire and forget)
        );
        log(`Triggered email verification for ${userId}`);
      } catch (fnErr) {
        error(`Failed to trigger email verification: ${fnErr.message}`);
        // Do not fail the whole function, as profile is already created
      }
    } else {
      log(
        "VITE_APPWRITE_FUNCTION_EMAIL_VERIFICATION_ID not set, skipping auto-verification email.",
      );
    }

    return res.json(result);
  } catch (err) {
    error("onUserCreated failed: " + err.message);
    return res.json(
      { success: false, message: err.message, code: err.code },
      500,
    );
  }
};
