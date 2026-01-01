# Design Plan: Extending to Normalize Japanese-Western Text Spacing

## Current State Analysis

### What the Plugin Does Now

- **Removes spaces BETWEEN Japanese characters** (Han, Hiragana, Katakana)
- **Preserves spaces at boundaries** between Japanese and Western text
- Uses regex with Script_Extensions: `\p{scx=Han}`, `\p{scx=Hiragana}`, `\p{scx=Katakana}`

**Current Behavior Examples:**

```
"これ は 日本語 です"  →  "これは日本語です"        ✓ (removes JA↔JA spaces)
"Hello 世界 です"     →  "Hello 世界です"         ✓ (preserves EN↔JA space)
"2024 年 1 月"       →  "2024年1月"              ✓ (removes spaces with numbers)
```

### The Gap: Inconsistent Japanese-Western Boundaries

The current implementation leaves boundaries untouched, which can result in:

- `"Hello世界"` (no space at boundary - hard to read)
- `"2024 年"` (space with unit - non-standard)

## Proposed Extension: Space Normalization

### Concept: "Normalize" vs "Remove"

- **Current**: "Remove" - one-directional, deletes spaces
- **Proposed**: "Normalize" - bidirectional, standardizes spacing according to rules

### Typography Considerations

Japanese typography has varying conventions for Japanese-Western boundaries:

1. **Modern Digital Style**: Add spaces between Japanese and Western text
   - `"iPhoneを使う"` → `"iPhone を使う"`
   - Improves readability, common in web/digital content

2. **Traditional Style**: No spaces anywhere
   - `"iPhone を使う"` → `"iPhoneを使う"`
   - More compact, traditional print style

3. **Smart Context-Aware**: Different rules for different contexts
   - Numbers + units: no space (`"2024年"`, `"100円"`)
   - Standalone words: add space (`"PDF ファイル"`, `"API を使う"`)

## Design Sketch

### 1. Architecture Changes

#### Core Module (`src/utils/textProcessor.ts`)

**Current (cb0c0dc):**

```typescript
export const removeSpaces: (text: string) => string;
export const hasRemovableSpaces: (text: string) => boolean;
```

**Proposed Types:**

```typescript
// Strategy is a pure function: text → text
type NormalizationStrategy = (text: string) => string;

// Strategy implementations (each builds on removeJaOnly as base)
const removeJaOnly: NormalizationStrategy = (text) => {
  /* current behavior */
};
const addBoundaries: NormalizationStrategy = (text) => {
  /* removeJaOnly + add boundary spaces */
};
/** Context-aware normalization: addBoundaries with exceptions for units/particles */
const smart: NormalizationStrategy = (text) => {
  /* ... */
};
const removeAll: NormalizationStrategy = (text) => {
  /* remove all spaces */
};

// Registry for UI/preferences lookup
const strategies = {
  removeJaOnly,
  addBoundaries,
  smart,
  removeAll,
} as const;

type StrategyName = keyof typeof strategies;
```

**Detection helper:**

```typescript
const hasNormalizableContent = (
  text: string,
  strategy: NormalizationStrategy,
): boolean => strategy(text) !== text;
```

#### Regex Patterns to Add

**Detect Japanese↔Western boundaries:**

```typescript
// Japanese followed by Western (no space)
/(?<=[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}])(?=[\p{Script=Latin}\p{Nd}])/gu

// Western followed by Japanese (no space)
/(?<=[\p{Script=Latin}\p{Nd}])(?=[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}])/gu
```

**Smart detection for units/particles (boundary exceptions):**

```typescript
// Digit→Unit boundary: don't add space (e.g., "2024年" stays as-is)
const noSpaceBeforeUnit = /\d(?=[年月日時分秒円個人回台本枚頁度])/gu;

// Unit→Digit boundary: add space (e.g., "年2024" → "年 2024")
// (no exception needed - follows normal addBoundaries behavior)

// Japanese→Particle: no script boundary (both JA), handled by removeJaOnly
// Particle patterns only relevant for removing OCR artifacts like "API を 使う"
const spaceBeforeParticle = /\s+(?=[をはがのにへとより])/gu;
```

### 2. UI Changes

#### Preferences (`addon/preferences.xhtml`)

**Add normalization strategy preference:**

```xml
<setting pref="extensions.zotero.removeSpaceJa.normalizationStrategy"
         type="menulist">
  <menulist>
    <menupopup>
      <menuitem label="Remove Japanese spaces only (current)" value="removeJaOnly"/>
      <menuitem label="Add spaces between Japanese and Western text" value="addBoundaries"/>
      <menuitem label="Smart normalization (recommended)" value="smart"/>
      <menuitem label="Remove all spaces (traditional)" value="removeAll"/>
    </menupopup>
  </menulist>
</setting>
```

#### Button Label (`src/modules/reader.ts`)

**Current**: "Remove Space"
**Proposed**: "Normalize Spaces" (more general, reflects bidirectional operation)

### 3. File Changes Summary

#### Files to Modify:

1. **`src/utils/textProcessor.ts`** + **`test/textProcessor.test.ts`**
   - Add `NormalizationStrategy` type and strategy functions
   - Update `removeSpaces()` to `normalizeSpaces()`
   - Add boundary detection logic
   - Keep backward compatibility with current behavior
   - Add tests for all strategies and edge cases

2. **`src/modules/reader.ts`**
   - Update button label from "Remove Space" to "Normalize Spaces"
   - Read normalization strategy from preferences
   - Pass strategy to textProcessor
   - Update detection logic to use `hasNormalizableSpaces()`

3. **`addon/preferences.xhtml`**
   - Add normalization strategy dropdown
   - Add explanatory text/examples for each strategy

4. **`addon/locale/en-US/*.ftl`** and **`addon/locale/ja-JP/*.ftl`**
   - Update button labels and tooltips
   - Add preference labels and descriptions
   - Add strategy option labels

5. **`src/utils/prefs.ts`**
   - Add default preference for normalization strategy

6. **`package.json`**
   - Update plugin name/description to reflect new functionality

### 4. Example Transformations by Strategy

| Input              | REMOVE_JA_ONLY (current) | ADD_BOUNDARIES   | SMART              | REMOVE_ALL       |
| ------------------ | ------------------------ | ---------------- | ------------------ | ---------------- |
| `"これ は 日本語"` | `"これは日本語"`         | `"これは日本語"` | `"これは日本語"`   | `"これは日本語"` |
| `"Hello世界"`      | `"Hello世界"`            | `"Hello 世界"`   | `"Hello 世界"`     | `"Hello世界"`    |
| `"2024年1月"`      | `"2024年1月"`            | `"2024 年 1 月"` | `"2024年1月"` ⭐   | `"2024年1月"`    |
| `"100 円 です"`    | `"100円です"`            | `"100 円です"`   | `"100円です"` ⭐   | `"100円です"`    |
| `"PDF を 読む"`    | `"PDF を読む"`           | `"PDF を読む"`   | `"PDF を読む"` ⭐  | `"PDFを読む"`    |

⭐ = SMART strategy uses context-aware rules (units attach to digits, particles at boundaries keep space)

## Naming Recommendations

### Option 1: "Space Normalizer" (Recommended)

**Pros:**

- Clear, technical term
- "Normalize" is well-understood in software
- Works well in English and as "スペース正規化" in Japanese

**English:**

- Plugin: "Space Normalizer for Japanese/Western Text"
- Short: "Space Normalizer"
- Button: "Normalize Spaces"

**Japanese:**

- Plugin: "和欧間正規化"
- Short: "和欧間正規化"
- Button: "和欧間正規化"

### Option 2: "Japanese-Western Text Spacing"

**Pros:**

- Descriptive, explains what it does
- Clear audience targeting

**English:**

- Plugin: "Japanese-Western Text Spacing"
- Button: "Adjust Spacing"

**Japanese:**

- Plugin: "和欧字間調整"
- Button: "字間を調整"

### Recommendation: **Option 1 - "Space Normalizer"**

**Rationale:**

1. "Normalize" is the correct technical term for standardizing to a canonical form
2. Familiar to developers and translates well (正規化)
3. Shorter and more memorable than Option 2
4. Flexible enough to include current and new functionality
5. Matches industry conventions (Unicode normalization, text normalization, etc.)

**Final Names:**

- **Plugin ID**: `zotero-ja-space-normalizer` (keeps "ja" to indicate Japanese specificity)
- **Plugin Display Name**: "Space Normalizer for Japanese/Western Text" or "Japanese-Western Space Normalizer"
- **Short Name**: "Space Normalizer (JA)"
- **Button Label**: "Normalize Spaces" / "和欧間正規化"
- **Function Name**: `normalizeSpaces()`
- **Preference Key**: `extensions.zotero.japaneseSpaceNormalizer.strategy`

## Implementation Phases

### Phase 1: Strategy Functions (Breaking Changes OK)

1. **Rename** `removeSpaces()` → `normalizeSpaces()` (no backward compatibility wrapper)
2. Add `NormalizationStrategy` type and strategy functions to `textProcessor.ts`
3. Implement boundary detection regex patterns
4. Implement all 4 strategies:
   - `removeJaOnly` (existing behavior)
   - `addBoundaries` (add spaces at JA↔Western boundaries)
   - `smart` (context-aware, **set as default**)
   - `removeAll` (traditional style)
5. Add tests for all strategies and edge cases

### Phase 2: Context Detection Patterns

1. Define unit/particle patterns (年月日時分秒円, をはがの, etc.)
2. Implement context detection for numbers + units
3. Implement context detection for particles
4. Add tests for unit/particle detection
5. Test with real-world PDF annotation examples

### Phase 3: Plugin Renaming & UI Updates

1. **Rename plugin**: Update `package.json`, IDs, display names
   - "Remove Space (JA)" → "Space Normalizer (JA)" / "和欧間正規化"
2. Update button labels: "Remove Space" → "Normalize Spaces" / "和欧間正規化"
3. Add preference UI for strategy selection in `preferences.xhtml`
4. Set default preference to `smart` strategy in `prefs.ts`

### Phase 4: Localization

1. Update all English locale strings in `addon/locale/en-US/`
2. Update all Japanese locale strings in `addon/locale/ja-JP/`
3. Add strategy option descriptions and examples
4. Ensure consistency: use "和欧間正規化" throughout Japanese locale

### Phase 5: Documentation

1. Update README with new functionality and examples
2. Update CLAUDE.md with architectural changes

### Phase 6: GitHub Repository Rename

1. Rename repository: `zotero-remove-space-ja` → `zotero-space-normalizer-ja`
2. Update all internal references (CLAUDE.md, README, etc.)
3. GitHub will auto-redirect old URLs

## Migration Strategy

**Post v1.0 Release**: Breaking changes now require deprecation strategy.

**Note**: This plan was created during pre-release (Day 0), when breaking changes were acceptable. Now that v1.0 is released, consider:

1. **Wrapper approach**: Keep `removeSpaces()` as alias calling `normalizeSpaces(text, removeJaOnly)`
2. **Default strategy**: `removeJaOnly` to maintain current behavior for existing users
3. **Opt-in**: Users can change to new strategies via preferences
4. **Version note**: Document in changelog when new strategies are added

## Appendix: Why Japanese-specific, not CJK/CJKV

**Target Languages**: Japanese (日本語) specifically

- **Japanese** (J): Uses Han (漢字) + Hiragana + Katakana, frequently mixed with Latin text
- **Chinese** (C): Uses Han (漢字/汉字) mixed with Latin, but different typography conventions (out of scope for now)
- **Korean** (K): ❌ Uses Hangul (alphabetic system), rarely uses Hanja anymore - NOT applicable
- **Vietnamese** (V): ❌ Uses Latin script, abandoned Chữ Nôm - NOT applicable

Korean and Vietnamese have transitioned to alphabetic writing systems and don't have the Han character + Latin mixing problem that Japanese has. This plugin focuses on **Japanese typography conventions** for mixed Japanese-Western text.

**Note on Chinese**: While Chinese text also mixes Han characters with Latin (e.g., "使用iPhone"), the typography conventions differ. Future expansion to Chinese would require separate research into Chinese typography standards (GB/T format standards, etc.)

## Appendix: Why Not CSS `text-autospace`?

CSS has a [`text-autospace`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace) property that automatically adds visual spacing between CJK and Latin characters:

```css
.annotation-text {
  text-autospace: ideograph-alpha ideograph-numeric;
}
```

**Why we can't use it:**

1. **Browser support**: Requires Firefox 145+, but Zotero 7 uses Firefox 115 and Zotero 8 uses Firefox 140
2. **Visual-only**: Doesn't modify actual text—copied/exported text still lacks spaces
3. **Different goal**: We need normalized text for portability, not just visual presentation

**Future consideration**: When Zotero upgrades to Firefox 145+, this could complement text normalization for display purposes.
