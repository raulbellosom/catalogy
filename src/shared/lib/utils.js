/**
 * Utility to merge class names
 * A simple replacement for clsx + tailwind-merge when those libraries are not available.
 * Filters out falsy values and joins with space.
 *
 * @param {...(string|undefined|null|false)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
