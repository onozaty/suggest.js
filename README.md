# suggest.js

A simple input suggestion library that provides autocomplete functionality for web applications.

## Features

- 🚀 **Client-side search** - No server requests needed during typing
- 🎯 **Flexible matching** - Prefix or partial text matching
- ⌨️ **Keyboard navigation** - Arrow keys, Enter, Escape, and Tab support
- 🖱️ **Mouse interaction** - Click and hover support
- 🎨 **Customizable styling** - CSS classes for different states
- 🔤 **Case options** - Case-sensitive or insensitive search
- ✨ **Text highlighting** - Highlight matching portions
- 🏷️ **Multi-token support** - Handle multiple values with delimiters
- 📦 **Zero dependencies** - No external libraries required

## Installation

### Package Manager

```bash
npm install @onozaty/suggest
# or
yarn add @onozaty/suggest
# or
pnpm add @onozaty/suggest
```

### CDN

```html
<!-- IIFE version (creates global Suggest object) -->
<script src="https://unpkg.com/@onozaty/suggest@latest/dist/suggest.js"></script>

<!-- ES Module -->
<script type="module">
  import { Suggest } from 'https://unpkg.com/@onozaty/suggest@latest/dist/suggest.mjs';
</script>
```

## Basic Usage

Complete working example:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .suggestions {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      width: 200px;
      z-index: 1;
    }
    .suggestions div {
      padding: 4px;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
    }
    .suggestions div.over {
      background-color: #f0f0f0;
    }
    .suggestions div.select {
      background-color: #e3f2fd;
    }
  </style>
</head>
<body>
  <input id="searchInput" type="text" autocomplete="off" placeholder="Start typing...">
  <div id="suggestions" class="suggestions" style="display:none;"></div>

  <script src="https://unpkg.com/@onozaty/suggest@latest/dist/suggest.js"></script>
  <script>
    const countries = [
      'United States', 'United Kingdom', 'Japan',
      'Germany', 'France', 'Canada', 'Australia'
    ];

    // Basic usage
    new Suggest.Local('searchInput', 'suggestions', countries);
  </script>
</body>
</html>
```

### Using with Package Managers

Install via npm/yarn/pnpm and import:

```typescript
import { Suggest } from '@onozaty/suggest';

const data = ['apple', 'banana', 'cherry'];
new Suggest.Local('inputId', 'suggestionsId', data, {
  highlight: true
});
```

### Multi-token Input

For inputs that accept multiple values with delimiters:

```javascript
const tags = ['javascript', 'typescript', 'react', 'vue'];

new Suggest.LocalMulti('tagsInput', 'tagSuggestions', tags, {
  delim: ', ',  // Custom delimiter
  highlight: true
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | number | 500 | Search delay in milliseconds |
| `dispMax` | number | 20 | Maximum number of suggestions to display |
| `listTagName` | string | 'div' | HTML tag for suggestion items |
| `prefix` | boolean | false | Only match from the beginning of strings |
| `ignoreCase` | boolean | true | Case-insensitive search |
| `highlight` | boolean | false | Highlight matching text with `<strong>` tags |
| `dispAllKey` | boolean | false | Enable Ctrl+Down to show all suggestions |
| `classMouseOver` | string | 'over' | CSS class applied on mouse hover |
| `classSelect` | string | 'select' | CSS class applied on keyboard selection |
| `hookBeforeSearch` | function | - | Callback function called before each search |

### Multi-token Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delim` | string | ' ' | Delimiter for separating multiple values |

## Keyboard Controls

- **↑/↓ Arrow Keys**: Navigate through suggestions
- **Enter**: Select current suggestion
- **Escape**: Cancel and restore original input
- **Tab**: (Multi-token only) Select suggestion and add delimiter
- **Ctrl+↓**: (If `dispAllKey: true`) Show all available suggestions

## TypeScript Support

Full TypeScript support with exported interfaces:

```typescript
import { Suggest, SuggestOptions, SuggestMultiOptions } from '@onozaty/suggest';

const options: SuggestOptions = {
  dispMax: 10,
  highlight: true,
  hookBeforeSearch: (text: string) => {
    console.log('Searching for:', text);
  }
};
```

## Demo

[**View Live Demo**](https://onozaty.github.io/suggest.js/) 

Interactive demo page to see the library in action.

## License

MIT

## Author

[onozaty](https://github.com/onozaty)
