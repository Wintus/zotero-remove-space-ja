# Zotero Remove Space (Japanese)

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

A Zotero 7 plugin that removes unnecessary spaces from PDF annotations, particularly for Japanese text.

[English](README.md) | [日本語](doc/README-ja.md)

## Motivation

When using the Zotero PDF reader to select and highlight text in PDFs, unnecessary spaces are often included in the generated annotations. This is especially problematic for Japanese texts where word boundaries don't use spaces. This plugin provides a simple button to automatically remove these unwanted spaces.

## Features

- **One-click space removal**: Adds a "Remove Space" button to each annotation in the PDF reader sidebar
- **Smart Japanese text detection**: Uses Unicode script properties to identify Japanese characters (Kanji, Hiragana, Katakana)
- **Preserves legitimate spaces**: Only removes spaces between Japanese characters; keeps spaces between Japanese and Latin/numeric characters

## Installation

1. Download the latest `.xpi` file from the [Releases page](https://github.com/Wintus/zotero-remove-space-ja/releases)
2. In Zotero, go to Tools → Add-ons
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file

## Usage

1. Open a PDF in the Zotero reader
2. Create or select a highlight annotation
3. In the sidebar, find the annotation with unwanted spaces
4. Click the "Remove Space" button that appears in the annotation header
5. The spaces between Japanese characters will be removed automatically

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm run test
```

See [CLAUDE.md](CLAUDE.md) for detailed development documentation.

## Technical Details

The plugin uses Unicode script property escapes to accurately detect Japanese characters:

```typescript
const pattern =
  /(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu;
```

This pattern:

- `\p{Script=Han}` - Matches Kanji (Chinese characters)
- `\p{Script=Hiragana}` - Matches Hiragana
- `\p{Script=Katakana}` - Matches Katakana
- Uses lookbehind and lookahead to only remove spaces surrounded by Japanese characters

## References

- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) - Base template
- [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) - Development toolkit
- [zotero-pdf-translate](https://github.com/windingwind/zotero-pdf-translate) - Reference implementation

## License

AGPL-3.0
