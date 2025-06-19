# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

suggest.js is a TypeScript-based input suggestion library for web browsers. It provides autocomplete/typeahead functionality for HTML input elements with two main classes:

- `SuggestLocal`: Basic suggestion functionality
- `SuggestLocalMulti`: Multi-token suggestion with delimiter support

## Architecture

The main source file is `src/suggest.ts` which contains:
- TypeScript interfaces (`SuggestOptions`, `SuggestMultiOptions`)
- `SuggestLocal` class: Core suggestion functionality with keyboard navigation, mouse events, and customizable styling
- `SuggestLocalMulti` class: Extends `SuggestLocal` for multi-token input with delimiter-based parsing
- Event-driven architecture using DOM event listeners for focus, blur, keydown, click, mouseover, and mouseout

Key architectural patterns:
- Class inheritance (`SuggestLocalMulti` extends `SuggestLocal`)
- Timer-based input polling with configurable intervals
- Protected methods for customization in subclasses
- HTML element manipulation with XSS protection via `escapeHTML`

## Build System

- **Build tool**: tsup (TypeScript Universal Packager)
- **Output formats**: ESM, CommonJS, and IIFE
- **Target**: ES2022 for modern browser support
- **Platform**: Browser-focused with DOM types

## Development Commands

```bash
# Build the library
pnpm build

# Development mode with watch
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Format code
pnpm format
```

## Testing Framework

- **Test runner**: Vitest with jsdom environment
- **Testing utilities**: @testing-library/jest-dom for DOM assertions
- **Setup**: Japanese comments in test setup indicate international development context
- **Test files**: Located in `test/` directory with descriptive names like `suggest-events.test.ts`

## TypeScript Configuration

- Strict mode enabled with ES2022 target
- Module resolution set to "bundler" for modern tooling
- Declaration files generated for library consumers
- Global vitest types included for testing