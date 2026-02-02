import { Client, Databases, Users } from "node-appwrite";

/**
 * Catalogy — syncUserProfile
 *
 * Uso recomendado:
 * - Se invoca desde el frontend autenticado (con sesión Appwrite).
 * - La Function usa APPWRITE_FUNCTION_USER_ID (inyectado por Appwrite) como fuente de verdad.
 *
 * Qué hace:
 * 1) Actualiza el documento `profiles/{userId}` (firstName, lastName, phone, avatarFileId)
 * 2) Sincroniza `name`, `email` y `phone` en Appwrite Auth.
 * 3) Si el email cambia, resetea emailVerified a false
 *
 * Seguridad:
 * - Solo permite actualizar el perfil del usuario autenticado
 */

function safeStr(v, maxLen) {
  const s = String(v ?? "").trim();
  return maxLen ? s.slice(0, maxLen) : s;
}

function buildFullName(firstName, lastName) {
  return `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
}

function formatPhone(phone) {
  if (!phone) return "";
  const raw = String(phone).trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (raw.startsWith("+")) return raw.replace(/[^+\d]/g, "");
  // default MX if 10 digits
  if (digits.length === 10) return `+52${digits}`;
  return `+${digits}`;
}

export default async ({ req, res, log, error }) => {
  const client = new Client();
  const users = new Users(client);
  const db = new Databases(client);

  const endpoint =
    process.env.APPWRITE_FUNCTION_ENDPOINT || process.env.APPWRITE_ENDPOINT;
  const projectId =
    process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
  const apiKey =
    process.env.APPWRITE_FUNCTION_API_KEY || process.env.APPWRITE_API_KEY;

  const databaseId = process.env.APPWRITE_DATABASE_ID || "main";
  const profilesCollectionId =
    process.env.APPWRITE_PROFILES_COLLECTION_ID || "profiles";

  if (!endpoint || !projectId || !apiKey) {
    error("Missing APPWRITE endpoint/projectId/apiKey env vars");
    return res.json({ success: false, message: "Server misconfigured" }, 500);
  }

  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

  // Parse body
  let body = {};
  try {
    const raw = req.body ?? req.payload ?? "{}";
    body = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    return res.json({ success: false, message: "Invalid JSON body" }, 400);
  }

  // Determine userId (only authenticated invocations allowed)
  const userId =
    process.env.APPWRITE_FUNCTION_USER_ID || req.headers["x-appwrite-user-id"];

  if (!userId) {
    return res.json(
      { success: false, message: "Unauthorized (no function user id)" },
      401,
    );
  }

  const firstName = safeStr(body.firstName, 80);
  const lastName = safeStr(body.lastName, 80);
  const fullName = buildFullName(firstName, lastName);

  const email = safeStr(body.email, 100);
  const phone = formatPhone(body.phone);

  // Build patch object dynamically
  const patch = {};
  if (firstName || body.firstName === "") patch.firstName = firstName;
  if (lastName || body.lastName === "") patch.lastName = lastName;

  // Be careful with email/phone uniqueness constraints
  // Only add if explicitly provided in body
  if (body.email !== undefined) patch.email = email;
  if (body.phone !== undefined) patch.phone = phone;

  // Fetch Auth User to check for changes
  let authUser = null;
  try {
    authUser = await users.get(userId);
  } catch (e) {
    // If user not found in Auth, we can't sync
    log(`Auth user ${userId} not found: ${e.message}`);
    return res.json({ success: false, message: "Auth user not found" }, 404);
  }

  // Check if email changed -> reset emailVerified
  if (
    authUser &&
    email &&
    email.toLowerCase() !== authUser.email.toLowerCase()
  ) {
    patch.emailVerified = false;
    patch.phoneVerified = false;
    log(`Email changed for ${userId}: resetting emailVerified to false.`);
  }

  // Check if phone changed -> reset phoneVerified
  if (authUser && phone && phone !== authUser.phone) {
    patch.phoneVerified = false;
    log(`Phone changed for ${userId}: resetting phoneVerified to false.`);
  }

  if (body.avatarFileId !== undefined)
    patch.avatarFileId = safeStr(body.avatarFileId, 64);

  if (Object.keys(patch).length === 0) {
    return res.json({ success: true, message: "No changes detected" });
  }

  try {
    log(
      `Updating profile ${userId}. Patch keys: ${Object.keys(patch).join(", ")}`,
    );

    // 1) Update profile document
    try {
      await db.updateDocument(databaseId, profilesCollectionId, userId, patch);
    } catch (dbErr) {
      log(`DB Update failed for ${userId}: ${dbErr.message}`);
      throw dbErr;
    }

    // 2) Sync auth name, email, phone
    const updates = [];

    // Sync Name
    if (fullName && fullName !== authUser.name) {
      await users.updateName(userId, fullName);
      updates.push("name");
    }

    // Sync Email
    if (email && email.toLowerCase() !== authUser.email.toLowerCase()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        await users.updateEmail(userId, email);
        updates.push("email");
      }
    }

    // Sync Phone
    if (phone && phone !== authUser.phone) {
      const e164Regex = /^\+[1-9]\d{1,14}$/;
      if (e164Regex.test(phone)) {
        await users.updatePhone(userId, phone);
        updates.push("phone");
      }
    }

    return res.json({
      success: true,
      userId,
      updatedProfile: Object.keys(patch),
      syncedAuth: updates,
    });
  } catch (err) {
    error("syncUserProfile failed: " + err.message);
    // Return detailed error for debugging
    return res.json(
      { success: false, message: err.message, code: err.code || 500 },
      500,
    );
  }
};
