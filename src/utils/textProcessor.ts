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
 * - `\p{Script=Han}` - Matches Han characters (Kanji/Chinese characters)
 * - `\p{Script=Hiragana}` - Matches Hiragana characters
 * - `\p{Script=Katakana}` - Matches Katakana characters
 * - `\s+` - Matches one or more whitespace characters
 * - `(?=...)` - Positive lookahead: ensures the space is followed by a Japanese character
 * - `g` flag - Global matching (replace all occurrences)
 * - `u` flag - Unicode mode (required for \p{Script=...} syntax)
 *
 * This pattern automatically preserves spaces between Japanese and non-Japanese
 * characters (e.g., Latin letters, numbers), which is the desired behavior.
 */
export const japaneseSpacePattern: RegExp =
  /(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu;

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
 * // Preserves spaces with numbers
 * removeSpaces("2024 年 1 月")
 * // Returns: "2024年1月"
 * ```
 */
export const removeSpaces = (text: string): string =>
  text.replace(japaneseSpacePattern, "");

/**
 * Check if the text contains any spaces that would be removed.
 *
 * Useful for determining whether the removeSpaces operation would
 * have any effect, allowing UI to provide appropriate feedback.
 *
 * @param text - The text to check
 * @returns true if the text contains removable spaces, false otherwise
 */
export const hasRemovableSpaces = (text: string): boolean =>
  japaneseSpacePattern.test(text);
