/**
 * Text processing utilities for removing unnecessary spaces from Japanese text.
 *
 * This module implements space removal logic using Unicode script properties
 * to accurately detect Japanese characters (Han/Kanji, Hiragana, Katakana).
 */

/**
 * Regular expression pattern to match spaces between Japanese characters.
 *
 * Pattern explanation:
 * - `(?<=...)` - Positive lookbehind: ensures the space comes after a Japanese character
 * - `\p{scx=Han}` - Matches Han characters (Kanji/Chinese characters) using Script_Extensions
 * - `\p{scx=Hiragana}` - Matches Hiragana characters using Script_Extensions
 * - `\p{scx=Katakana}` - Matches Katakana characters using Script_Extensions
 * - `\s+` - Matches one or more whitespace characters
 * - `(?=...)` - Positive lookahead: ensures the space is followed by a Japanese character
 * - `u` flag - Unicode mode (required for \p{scx=...} syntax)
 *
 * Note: Using `scx` (Script_Extensions) instead of `Script` catches more characters
 * commonly used in Japanese text, including certain punctuation and shared characters.
 *
 * This pattern automatically preserves spaces between Japanese and non-Japanese
 * characters (e.g., Latin letters, numbers), which is the desired behavior.
 */
const japaneseSpacePattern: RegExp =
  /(?<=[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}])\s+(?=[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}])/u;

/**
 * Regular expression pattern to match multiple consecutive whitespace characters.
 *
 * This pattern is used to normalize inconsistent spacing (e.g., double spaces)
 * into a single space before applying Japanese-specific space removal.
 */
const multiSpacePattern: RegExp = /\s{2,}/;

// Derive global versions for use with .replace()
const japaneseSpacePatternGlobal = new RegExp(japaneseSpacePattern, "gu");
const multiSpacePatternGlobal = new RegExp(multiSpacePattern, "g");

/**
 * Remove unnecessary spaces from text containing Japanese characters.
 *
 * This function removes spaces that appear between Japanese characters
 * (Han/Kanji, Hiragana, Katakana) while preserving spaces between
 * Japanese and non-Japanese characters.
 *
 * @param text - The input text to process
 * @returns The text with spaces between Japanese characters removed
 *
 * @example
 * ```typescript
 * // Removes spaces between Japanese characters
 * removeSpaces("これ は 日本語 です")
 * // Returns: "これは日本語です"
 *
 * // Preserves spaces between Japanese and English
 * removeSpaces("Hello 世界 です")
 * // Returns: "Hello 世界です"
 *
 * // Normalizes double spaces at boundaries
 * removeSpaces("Hello  世界 です")
 * // Returns: "Hello 世界です"
 *
 * // Preserves spaces between numbers and Japanese (numbers are not JA characters)
 * removeSpaces("2024 年 1 月")
 * // Returns: "2024 年 1 月"
 * ```
 */
export const removeSpaces = (text: string): string =>
  text
    .replace(multiSpacePatternGlobal, " ")
    .replace(japaneseSpacePatternGlobal, "");

/**
 * Check if the text contains any spaces that would be removed or normalized.
 *
 * Useful for determining whether the removeSpaces operation would
 * have any effect, allowing UI to provide appropriate feedback.
 *
 * @param text - The text to check
 * @returns true if the text contains removable or normalizable spaces, false otherwise
 */
export const hasRemovableSpaces = (text: string): boolean =>
  multiSpacePattern.test(text) || japaneseSpacePattern.test(text);
