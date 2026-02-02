/**
 * Slug Validation Service
 *
 * Provee dos niveles de validación de slugs:
 * 1. Local (formato) - Para feedback inmediato al usuario
 * 2. Remota (disponibilidad) - Consulta a la función de Appwrite
 */

import { client } from "@/shared/lib/appwrite";
import { functions } from "@/shared/lib/env";
import { Functions } from "appwrite";

const functionsService = new Functions(client);

/**
 * Regex para validación de formato de slug
 * - 3-50 caracteres
 * - Solo lowercase, números y guiones
 * - No puede empezar/terminar con guión
 * - No guiones consecutivos
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MIN_LENGTH = 3;
export const MAX_LENGTH = 50;

/**
 * Validación local de formato de slug
 * Provee feedback inmediato sin llamadas a la API
 *
 * @param {string} slug - Slug a validar
 * @returns {{ valid: boolean, error?: string, slug?: string }}
 */
export function validateSlugFormat(slug) {
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    return { valid: false, error: "El slug es requerido" };
  }

  const trimmed = slug.trim().toLowerCase();

  if (trimmed.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `El slug debe tener al menos ${MIN_LENGTH} caracteres`,
    };
  }

  if (trimmed.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `El slug no puede exceder ${MAX_LENGTH} caracteres`,
    };
  }

  if (!SLUG_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Solo minúsculas, números y guiones (no al inicio ni al final)",
    };
  }

  return { valid: true, slug: trimmed };
}

/**
 * Validación remota usando la función de Appwrite
 * Verifica formato Y disponibilidad en la base de datos
 *
 * @param {string} slug - Slug a validar
 * @returns {Promise<{ valid: boolean, error?: string, slug?: string, reason?: string }>}
 */
export async function validateSlugRemote(slug) {
  try {
    // Validación local primero (evita llamadas innecesarias)
    const formatCheck = validateSlugFormat(slug);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Verificar que tengamos el ID de la función
    if (!functions.validateSlug) {
      console.error("VITE_APPWRITE_FUNCTION_VALIDATE_SLUG_ID no configurado");
      return {
        valid: false,
        error: "Servicio de validación no disponible",
      };
    }

    // Llamar a la función de Appwrite
    const execution = await functionsService.createExecution(
      functions.validateSlug,
      JSON.stringify({ slug: formatCheck.slug }),
      false, // Esperar respuesta
    );

    // Parsear respuesta
    const result = JSON.parse(execution.responseBody);

    if (!result.ok) {
      return {
        valid: false,
        error: result.message || "Error al validar slug",
      };
    }

    return {
      valid: result.valid,
      slug: result.slug,
      error: result.message,
      reason: result.reason,
    };
  } catch (error) {
    console.error("Error validating slug remotely:", error);
    return {
      valid: false,
      error: "Error de conexión al validar slug",
    };
  }
}

/**
 * Validación completa de slug (formato + disponibilidad)
 * Alias de validateSlugRemote para compatibilidad
 *
 * @param {string} slug - Slug a validar
 * @returns {Promise<{ valid: boolean, error?: string, slug?: string }>}
 */
export async function validateSlug(slug) {
  return validateSlugRemote(slug);
}

/**
 * Genera un slug a partir de un texto
 *
 * @param {string} text - Texto a convertir en slug
 * @returns {string} Slug generado
 */
export function generateSlug(text) {
  if (!text || typeof text !== "string") return "";

  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Guiones múltiples a uno solo
    .replace(/^-|-$/g, ""); // Eliminar guiones al inicio/final
}

/**
 * Sugiere slugs alternativos si el original no está disponible
 *
 * @param {string} baseSlug - Slug base
 * @param {number} count - Número de sugerencias
 * @returns {string[]} Array de slugs sugeridos
 */
export function suggestSlugs(baseSlug, count = 3) {
  const suggestions = [];
  const cleaned = generateSlug(baseSlug);

  for (let i = 1; i <= count; i++) {
    suggestions.push(`${cleaned}-${i}`);
  }

  return suggestions;
}
