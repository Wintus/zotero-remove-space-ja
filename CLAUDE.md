# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Zotero 7 plugin** that removes unnecessary spaces from PDF annotations, particularly for Japanese text. The plugin is built on the [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template).

**Current Status**: Phase 1 (Project Setup and Configuration) is complete. The plugin successfully builds and loads in Zotero 7. Next phases will implement the annotation button UI and space removal logic.

The plugin uses TypeScript and the zotero-plugin-toolkit for development.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
# This starts Zotero with the plugin loaded and watches for changes
npm start

# Build for production
# Also runs TypeScript type checking
npm run build

# Lint
npm run lint:check
npm run lint:fix

# Run tests
npm run test

# Release (bumps version, commits, tags, and triggers GitHub Actions)
npm run release
```

## Phase 1 Status: ✅ Complete

- ✅ `package.json` configured with plugin metadata
- ✅ `.env` created with Zotero 7 paths
- ✅ Template examples removed (`src/modules/examples.ts` deleted, `src/hooks.ts` cleaned)
- ✅ Locale files set up (en-US and ja-JP)
- ✅ Plugin builds and loads in Zotero 7

See `plan.md` for detailed development plan and next phases.

## Configuration Files

- `package.json` - Plugin metadata in the `config` section
- `zotero-plugin.config.ts` - Build configuration for zotero-plugin-scaffold
- `.env` - Local development environment (not in repo, copy from `.env.example`)

## Architecture

### Bootstrap Plugin Structure

This plugin runs as a bootstrapped Firefox extension. Key lifecycle:

1. **Startup**: `addon/bootstrap.js` → `src/index.ts` → `src/hooks.ts::onStartup()`
2. **Shutdown**: `src/hooks.ts::onShutdown()` → cleanup

### Entry Points

- `src/index.ts` - Registers the plugin instance under `Zotero[addonInstance]` and sets up global variables
- `src/hooks.ts` - All lifecycle hooks (onStartup, onShutdown, onMainWindowLoad, onNotify, onPrefsEvent, etc.)
- `src/addon.ts` - Main Addon class that holds plugin data and hooks

### Key Patterns

**Event-Driven Architecture**: The `hooks.ts` file acts as a dispatcher. Hook functions should only dispatch to specific implementation functions in modules, not contain business logic.

**Global Variables**: These are available globally after bootstrap:

```javascript
(Zotero, ZoteroPane, Zotero_Tabs, window, document, rootURI, ztoolkit, addon);
```

**Template Examples**: The template's `src/modules/examples.ts` has been removed from this project as part of Phase 1 cleanup. For reference patterns, consult:
- The [zotero-plugin-template examples](https://github.com/windingwind/zotero-plugin-template/blob/main/src/modules/examples.ts)
- The [zotero-pdf-translate implementation](https://github.com/windingwind/zotero-pdf-translate) (our reference implementation)
- The [zotero-plugin-toolkit documentation](https://windingwind.github.io/zotero-plugin-toolkit/reference/)

### Module Organization

- `src/modules/` - Feature implementations (preferenceScript.ts, reader.ts [planned])
- `src/utils/` - Utilities (locale.ts, prefs.ts, window.ts, ztoolkit.ts, textProcessor.ts [planned])
- `addon/` - Static assets (manifest.json, preferences.xhtml, locale files, CSS)
- `addon/locale/en-US/` - English translations
- `addon/locale/ja-JP/` - Japanese translations

### ZToolkit

The plugin uses [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) heavily. Access via the global `ztoolkit` variable. It provides utilities for:

- UI creation with automatic cleanup
- Dialog helpers
- Menu registration
- Keyboard shortcuts
- Progress windows
- And more

Use `ztoolkit.UI.createElement()` instead of `document.createElement()` for automatic namespace detection and cleanup on plugin unload.

## Build Process

The build (via zotero-plugin-scaffold) performs these steps:

1. Copy `addon/**` to `.scaffold/build/addon/**`
2. Replace placeholders with values from `package.json`
3. Prepare localization files (prefix FTL messages with `addonRef-`)
4. Prefix preference keys with `prefsPrefix`
5. Compile TypeScript (`src/index.ts` → `.scaffold/build/addon/content/scripts/${addonRef}.js`)
6. (Production only) Create XPI and update manifests

## Type Definitions

- `zotero-types` provides TypeScript types for Zotero APIs
- `typings/` contains additional custom type definitions

## Testing

Tests are in `test/` directory using Mocha and Chai. The scaffold's test command launches Zotero and runs tests within it.

## Working with Zotero APIs

The Zotero documentation is incomplete. Strategies for finding APIs:

1. **Use zotero-types** - Provides TypeScript definitions for most Zotero APIs (already included)
2. **Search the Zotero source** - Clone https://github.com/zotero/zotero and search globally
3. **Trace from UI to code** - Search UI labels in `.xhtml`/`.ftl` files → find locale keys → search those keys in `.js`/`.jsx` files
4. **Use `ztoolkit.UI.createElement()`** instead of `document.createElement()` - provides automatic namespace detection (HTML/XUL/SVG) and cleanup on unload

## Common Development Patterns

### Adding a New Feature

1. Create a new module in `src/modules/` or utility in `src/utils/`
2. Export factory classes or utility functions
3. Register your feature in appropriate hook in `src/hooks.ts`:
   - `onStartup()` - Register reader event listeners, notifiers, preferences, etc.
   - `onMainWindowLoad()` - Register window-specific UI (menus, stylesheets, prompts)
   - `onShutdown()` - Clean up (usually just `ztoolkit.unregisterAll()`)
4. Add locale strings in `addon/locale/en-US/` and `addon/locale/ja-JP/` as FTL files
5. Test with hot reload (`npm start`) or build and test (`npm run build && npm test`)

### Accessing Zotero Items

```typescript
// Get selected items
const items = ZoteroPane.getSelectedItems();

// Item operations
const title = item.getField("title");
item.setField("title", "New Title");
await item.saveTx();

// Search
const s = new Zotero.Search();
s.addCondition("title", "contains", "search term");
const itemIDs = await s.search();
```

## Development Notes

- Hot reload is enabled by default with `npm start` - changes to `src/**` or `addon/**` automatically rebuild and reload
- Use `Zotero.debug()` for logging (visible in Help → Debug Output Logging → View Output)
- Test code snippets in Tools → Developer → Run Javascript
- The plugin ID (`addonID`) must be unique to avoid conflicts
- Preference keys are automatically prefixed with `prefsPrefix` during build
- FTL localization files are automatically prefixed to avoid conflicts
- Environment variable `addon.data.env` is `"development"` or `"production"` - use this to enable/disable features
- Update `CLAUDE.md` and/or `plan.md` when an item gets done.
- Commit changes in adequate units.
