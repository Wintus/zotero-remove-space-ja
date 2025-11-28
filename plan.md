# Development Plan: Zotero Remove Space (Japanese)

## Project Overview

A Zotero 7 plugin that removes unnecessary spaces from PDF annotations, particularly for Japanese text. When users select and highlight text in PDFs, the plugin will add a button to each annotation that automatically removes unwanted spaces.

## Motivation

When using the Zotero PDF reader to select and highlight text in PDFs, unnecessary spaces are included in the generated annotations, especially in Japanese texts. This plugin automates the removal of these spaces through a simple button interface.

## Technical Foundation

- **Base Template**: [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- **Toolkit**: [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit)
- **Reference Implementation**: [zotero-pdf-translate](https://github.com/windingwind/zotero-pdf-translate)

## Development Phases

### Phase 1: Project Setup and Configuration

**Goal**: Customize the template for this specific plugin

**Tasks**:

1. Update `package.json` configuration:
   - `name`: `zotero-remove-space-ja`
   - `config.addonName`: `"Remove Space (JA)"` - Display name in Zotero's plugin manager
   - `config.addonID`: `"removespace-ja@wintus.com"` - **CRITICAL**: Must be globally unique
   - `config.addonRef`: `"removespace-ja"` - Used as prefix for DOM IDs and CSS classes
   - `config.addonInstance`: `"RemoveSpaceJA"` - Accessible as `Zotero.RemoveSpaceJA`
   - `config.prefsPrefix`: `"extensions.zotero.removespace-ja"` - Preference keys prefix
   - `repository`: `"https://github.com/Wintus/zotero-remove-space-ja"`
   - `author`: Update to your name/info
   - `bugs`: `"https://github.com/Wintus/zotero-remove-space-ja/issues"`
   - `homepage`: `"https://github.com/Wintus/zotero-remove-space-ja#readme"`
   - `description`: `"Remove unnecessary spaces from Japanese text in PDF annotations"`

2. Create `.env` file:
   - Copy from `.env.example`
   - Configure paths to Zotero 7 beta installation

3. Clean up template examples:
   - Review `src/modules/examples.ts` for reference patterns
   - Remove unnecessary example code after understanding patterns
   - Update `src/hooks.ts` to remove example registrations

4. Set up locale files:
   - Add Japanese locale (`addon/locale/ja-JP/`)
   - Add English locale (`addon/locale/en-US/`)
   - Define strings for button labels and messages

**Completion Criteria**:

- Plugin loads successfully in Zotero 7
- No template examples remain active
- Basic plugin structure is in place

---

### Phase 2: Annotation Button UI Implementation

**Goal**: Add a "Remove Space" button to each annotation in the PDF reader

**Reference**: [zotero-pdf-translate reader.ts](https://github.com/windingwind/zotero-pdf-translate/blob/v2.3.14/src/modules/reader.ts#L6-L68)

**Tasks**:

1. Create `src/modules/reader.ts` module:
   - Implement annotation UI modification logic
   - Follow patterns from zotero-pdf-translate reference

2. Hook into reader initialization:
   - Register reader event handlers in `src/hooks.ts::onStartup()`
   - Use **`Zotero.Reader.registerEventListener()`** ([type definition](https://github.com/windingwind/zotero-types/blob/bace7fb9dc62e0c708af997c0dbf864b6ad1459b/types/xpcom/reader.d.ts#L333)):
     ```typescript
     Zotero.Reader.registerEventListener(
       "renderSidebarAnnotationHeader",
       (event) => {
         const { reader, doc, params, append } = event;
         // params contains annotation data
         // Use append() or doc to inject button
         addon.hooks.onAnnotationHeaderRender(event);
       },
       config.addonID,
     );
     ```
   - **Primary event**: `"renderSidebarAnnotationHeader"` - Injects UI into annotation sidebar headers
   - **Alternative event**: `"renderTextSelectionPopup"` - For quick action on text selection (before annotation created)
   - **Other available events**: `renderToolbar`, `createAnnotationContextMenu`, `createColorContextMenu`, etc.
   - **Benefits**: Official Zotero API, automatic cleanup on unload, no DOM fragility, pluginID-based isolation

3. Add button to annotation UI:
   - Use `ztoolkit.UI.createElement()` for button creation
   - Insert button into annotation popup/sidebar
   - Style button appropriately (icon + text or icon-only)
   - Reference: [Button insertion code](https://github.com/windingwind/zotero-pdf-translate/blob/v2.3.14/src/modules/reader.ts#L17-L67)

4. Button behavior:
   - Add click event handler
   - Connect to space removal logic (Phase 3)
   - Provide visual feedback on action

**API References**:

- [UITool.insertElementBefore()](https://windingwind.github.io/zotero-plugin-toolkit/reference/Class.UITool.html#insertelementbefore)
- [ElementProps Interface](https://windingwind.github.io/zotero-plugin-toolkit/reference/Interface.ElementProps.html)

**Completion Criteria**:

- Button appears on each annotation
- Button is properly styled and positioned
- Click event is captured (even if no action yet)

---

### Phase 3: Space Removal Logic

**Goal**: Implement the core logic to remove unwanted spaces from text

**Tasks**:

1. Create `src/utils/textProcessor.ts`:
   - Implement space removal using Unicode script properties
   - Export regex pattern and processing function
   - Handle edge cases (mixed language text, legitimate spaces)

2. Core regex pattern (from issue #13):

   ```typescript
   export const pattern: RegExp =
     /(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu;
   ```

   This pattern:
   - Uses Unicode script properties for accurate character detection
   - `\p{Script=Han}` - Kanji (Chinese characters)
   - `\p{Script=Hiragana}` - Hiragana
   - `\p{Script=Katakana}` - Katakana
   - Positive lookbehind `(?<=...)` and lookahead `(?=...)` ensure spaces are only removed when surrounded by Japanese characters
   - `g` flag for global matching, `u` flag for Unicode support
   - Automatically preserves spaces between Japanese and non-Japanese characters (Latin, numbers, etc.)

3. Text processing implementation:

   ```typescript
   export function removeSpaces(text: string): string {
     return text.replace(pattern, "");
   }
   ```

   The regex handles all the complexity automatically:
   - Removes spaces between Japanese characters
   - Preserves spaces between Japanese and alphanumeric characters
   - Handles mixed-language text correctly
   - No manual character type detection needed

4. Integration with annotation:
   - Get annotation text content
   - Process with `removeSpaces()` function
   - Update annotation with cleaned text
   - Save annotation changes

**Technical Details**:

- Modern JavaScript Unicode property escapes (ES2018+)
- More semantically correct than Unicode ranges
- Better edge case handling
- More maintainable code

**Completion Criteria**:

- Spaces are correctly removed from Japanese text
- Mixed-language text is handled properly (spaces preserved between JP and non-JP)
- No legitimate spaces are removed incorrectly
- Annotation text is updated and saved

---

### Phase 4: User Experience Enhancements

**Goal**: Improve usability and provide feedback

**Tasks**:

1. Visual feedback:
   - Show success message/toast after removing spaces
   - Disable button briefly after use to prevent double-clicks
   - Consider undo functionality

2. Preferences (optional):
   - Add preference pane in `addon/preferences.xhtml`
   - Options to configure:
     - Enable/disable plugin
     - Auto-remove on annotation creation (vs manual button click)
     - Character set preferences

3. Keyboard shortcut (optional):
   - Register keyboard shortcut to trigger space removal
   - Use `ztoolkit` shortcuts API

4. Error handling:
   - Handle cases where annotation cannot be modified
   - Log errors appropriately with `Zotero.debug()`
   - Show user-friendly error messages

**Completion Criteria**:

- Users receive clear feedback when action completes
- Preferences work correctly (if implemented)
- No crashes or unhandled errors

---

### Phase 5: Testing and Refinement

**Goal**: Ensure plugin works reliably across different scenarios

**Tasks**:

1. Manual testing scenarios:
   - Japanese-only text annotations
   - Mixed Japanese-English text
   - Text with numbers and symbols
   - Long annotations vs short annotations
   - Multiple annotations in sequence

2. Edge case testing:
   - Empty annotations
   - Annotations with only spaces
   - Annotations with formatted text (bold, italic)
   - Annotations in different PDF types

3. Unit tests (optional):
   - Add tests in `test/` directory
   - Test space removal logic with various inputs
   - Use Mocha/Chai framework

4. Performance testing:
   - Ensure button doesn't slow down reader
   - Test with PDFs containing many annotations

**Completion Criteria**:

- All common use cases work correctly
- Edge cases are handled gracefully
- No performance degradation

---

### Phase 6: Documentation and Release

**Goal**: Prepare plugin for distribution

**Tasks**:

1. Update `README.md`:
   - Clear description of plugin purpose
   - Installation instructions
   - Usage guide with screenshots
   - Known limitations

2. Add changelog:
   - Create `CHANGELOG.md`
   - Document initial release features

3. Localization:
   - Complete Japanese translations
   - Complete English translations
   - Test both locales

4. Build and test XPI:
   - Run `npm run build`
   - Test production build
   - Verify all features work in built version

5. Release:
   - Use `npm run release` to create tagged release
   - GitHub Actions will build and publish
   - Submit to Zotero plugin repository (optional)

**Completion Criteria**:

- README is complete and accurate
- Both English and Japanese locales work
- Production build works correctly
- Release is tagged and published

---

## File Structure (Planned)

```
zotero-remove-space-ja/
├── src/
│   ├── modules/
│   │   ├── reader.ts          # Annotation UI modification
│   │   └── preferenceScript.ts # (from template, modify as needed)
│   ├── utils/
│   │   ├── textProcessor.ts   # Space removal logic
│   │   ├── locale.ts          # (from template)
│   │   └── prefs.ts           # (from template)
│   ├── hooks.ts               # Lifecycle hooks
│   ├── addon.ts               # Main addon class
│   └── index.ts               # Entry point
├── addon/
│   ├── locale/
│   │   ├── en-US/
│   │   │   └── addon.ftl
│   │   └── ja-JP/
│   │       └── addon.ftl
│   ├── chrome/
│   │   └── content/           # Icons, CSS
│   ├── preferences.xhtml
│   └── manifest.json
├── test/
│   └── textProcessor.test.ts  # Unit tests
├── package.json
├── .env                       # (git-ignored)
└── README.md
```

## Key Technical Decisions

1. **UI Approach**: Add button to each annotation (similar to translate plugin)
   - Alternative considered: Context menu item (less discoverable)

2. **Processing Trigger**: Manual button click
   - Alternative considered: Auto-process on annotation creation (could be optional preference)

3. **Scope**: Focus on Japanese text initially
   - Could expand to other languages in future

4. **Modification Strategy**: In-place annotation text update
   - Alternative considered: Create new annotation with cleaned text (more complex)

## Success Metrics

- Plugin successfully loads in Zotero 7
- Button appears on all annotations in PDF reader
- Spaces are correctly removed from Japanese text
- User can easily use the feature with one click
- No impact on Zotero performance or stability
- Clear documentation for users

## Timeline Estimate

- **Phase 1**: 2-3 hours (configuration and setup)
- **Phase 2**: 4-6 hours (UI implementation)
- **Phase 3**: 3-4 hours (core logic)
- **Phase 4**: 2-3 hours (UX improvements)
- **Phase 5**: 3-4 hours (testing)
- **Phase 6**: 2-3 hours (documentation and release)

**Total**: 16-23 hours of development time

## Next Steps

1. Start with Phase 1 - configure the plugin basics
2. Run `npm start` to verify development environment works
3. Study zotero-pdf-translate implementation in detail
4. Begin implementing Phase 2 (annotation UI)

## References

- [Zotero PDF Reader Annotations](https://www.zotero.org/support/pdf_reader#creating_annotations)
- [Zotero Plugin Development](https://www.zotero.org/support/dev/client_coding/plugin_development)
- [zotero-plugin-toolkit API](https://windingwind.github.io/zotero-plugin-toolkit/reference/)
- [zotero-pdf-translate (reference implementation)](https://github.com/windingwind/zotero-pdf-translate)
