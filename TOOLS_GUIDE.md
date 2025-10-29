# Tools Development Guide

> This guide is adapted from [Simon Willison's tools repository](https://github.com/simonw/tools), with modifications to match our shared CSS architecture. Many thanks to Simon for the excellent patterns and conventions.

## Repository Overview

**Location**: `/home/user/tools/`
**Type**: Static HTML/JavaScript web tools
**Hosting**: GitHub Pages (https://lepinkainen.github.io/tools/)
**Build**: Python script generates site structure
**Styling**: Shared CSS across all tools

---

## 1. Repository Structure

```
/home/user/tools/
├── *.html                    # Individual tool files
├── common.css                # Shared stylesheet for all tools
├── build.py                  # Generates dist/ structure and index
├── .github/workflows/
│   └── deploy.yml           # Deploys to GitHub Pages
├── .gitignore
├── README.md
├── TOOLS_GUIDE.md           # This file
└── LICENSE
```

### Build Output Structure
```
dist/
├── common.css               # Copied from root
├── index.html              # Auto-generated tool index
└── toolname/
    └── index.html          # Tool deployed here
```

---

## 2. Creating a New Tool

### Basic Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tool Name</title>
  <link rel="stylesheet" href="../common.css" />
  <style>
    /* Tool-specific styles only */
    .custom-widget {
      /* Your custom styles */
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Tool Name</h1>
    <p>Brief description of what your tool does</p>

    <div class="box">
      <label for="input">Input:</label>
      <input type="text" id="input" placeholder="Enter text...">
      <button onclick="process()">Process</button>
    </div>

    <div id="output" class="output"></div>
  </div>

  <script>
    function process() {
      const input = document.getElementById('input').value;
      const output = document.getElementById('output');
      // Your processing logic here
      output.textContent = `Result: ${input}`;
    }
  </script>
</body>
</html>
```

### Key Points

1. **Always link to `../common.css`** in the `<head>`
2. **Use existing CSS classes** from common.css (`.container`, `.box`, `.output`, etc.)
3. **Add tool-specific styles** in a `<style>` block if needed
4. **Keep it simple** - single self-contained HTML file
5. **Mobile-friendly** - common.css already handles responsive design

---

## 3. Available CSS Classes

The `common.css` stylesheet provides these ready-to-use classes:

### Layout
- `.container` - Centered content container (max-width: 1200px)
- `.box` - Bordered box with hover effects
- `.output` - Output/result display area

### Buttons
- `button` - Primary button styling (green)
- `button.secondary` - Secondary button style (blue)
- `button:disabled` - Disabled state

### Text & Alignment
- `.text-left` - Left-aligned text
- `.text-center` - Center-aligned text

### Spacing
- `.mt-1`, `.mt-2`, `.mt-3` - Margin top (10px, 20px, 30px)
- `.mb-1`, `.mb-2`, `.mb-3` - Margin bottom (10px, 20px, 30px)

### Form Elements
All standard inputs, textareas, and selects are pre-styled with the cyberpunk theme.

---

## 4. Common HTML Patterns

### Pattern 1: Simple Input/Output Tool

```html
<div class="container">
  <h1>URL Decoder</h1>

  <label for="encoded">Encoded URL:</label>
  <input type="text" id="encoded" placeholder="https%3A%2F%2Fexample.com">

  <button onclick="decode()">Decode</button>

  <div class="output">
    <label for="decoded">Decoded URL:</label>
    <input type="text" id="decoded" readonly>
    <button class="secondary" onclick="copyToClipboard()">Copy</button>
  </div>
</div>

<script>
function decode() {
  const encoded = document.getElementById('encoded').value;
  const decoded = document.getElementById('decoded');
  decoded.value = decodeURIComponent(encoded);
}
</script>
```

### Pattern 2: File Upload with Drag & Drop

```html
<div class="container">
  <h1>Image Processor</h1>

  <div id="dropZone" class="box">
    Drag and drop an image here or click to select
  </div>
  <input type="file" id="fileInput" accept="image/*" style="display: none;">

  <div id="output" class="output"></div>
</div>

<script>
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('active');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('active');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('active');
  const files = e.dataTransfer.files;
  handleFile(files[0]);
});

fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    // Process file
    console.log('File loaded:', e.target.result);
  };
  reader.readAsDataURL(file);
}
</script>
```

### Pattern 3: Real-time Processing

```html
<div class="container">
  <h1>Character Counter</h1>

  <textarea id="text" rows="10" placeholder="Type or paste text here..."></textarea>

  <div class="output">
    <p>Characters: <span id="charCount">0</span></p>
    <p>Words: <span id="wordCount">0</span></p>
  </div>
</div>

<script>
const textArea = document.getElementById('text');

textArea.addEventListener('input', () => {
  const text = textArea.value;
  document.getElementById('charCount').textContent = text.length;
  document.getElementById('wordCount').textContent =
    text.trim() ? text.trim().split(/\s+/).length : 0;
});
</script>
```

---

## 5. JavaScript Patterns

### Copy to Clipboard

```javascript
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Success feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}
```

### Loading States

```javascript
async function fetchData() {
  const button = document.getElementById('fetchBtn');
  button.disabled = true;
  button.textContent = 'Loading...';

  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    displayData(data);
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Fetch Data';
  }
}
```

### Error Handling

```javascript
function showError(message) {
  const output = document.getElementById('output');
  output.innerHTML = `<p style="color: #ff0000;">Error: ${message}</p>`;
  output.classList.add('visible');
}

function hideError() {
  const output = document.getElementById('output');
  output.classList.remove('visible');
}
```

---

## 6. Data Loading Patterns

### Pattern 1: Load from URL Hash

```javascript
// Load data from URL hash parameter
function loadFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/data=([^&]+)/);

  if (match) {
    const data = decodeURIComponent(match[1]);
    document.getElementById('input').value = data;
    process();
  }
}

loadFromHash();

// Listen for hash changes
window.addEventListener('hashchange', loadFromHash);

// Save to hash
function saveToHash(data) {
  window.location.hash = `data=${encodeURIComponent(data)}`;
}
```

### Pattern 2: LocalStorage Persistence

```javascript
// Save state to localStorage
function saveState() {
  const state = {
    input: document.getElementById('input').value,
    options: getOptions()
  };
  localStorage.setItem('toolState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const saved = localStorage.getItem('toolState');
  if (saved) {
    const state = JSON.parse(saved);
    document.getElementById('input').value = state.input;
    setOptions(state.options);
  }
}

// Auto-save on input
document.getElementById('input').addEventListener('input', saveState);

// Load on page load
window.addEventListener('DOMContentLoaded', loadState);
```

### Pattern 3: Fetch External Data

```javascript
async function loadExternalData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

// Usage
async function loadGist(gistId) {
  const url = `https://api.github.com/gists/${gistId}`;
  const gist = await loadExternalData(url);
  // Process gist data
}
```

---

## 7. External Libraries via CDN

When you need external libraries, load them from CDNs:

### Common Libraries

```html
<!-- Marked (Markdown parser) -->
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>

<!-- PDF.js (PDF rendering) -->
<script type="module">
  import pdfjsDist from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/+esm';
</script>

<!-- Tesseract.js (OCR) -->
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>

<!-- SQLite WASM -->
<script type="module">
  import sqlite3InitModule from 'https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.46.1-build4/sqlite-wasm/jswasm/sqlite3.mjs';
</script>

<!-- Chart.js (Charting) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

### Usage Example with Marked.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  <link rel="stylesheet" href="../common.css" />
  <script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>Markdown Preview</h1>

    <textarea id="markdown" rows="10" placeholder="Enter markdown..."></textarea>

    <div id="preview" class="output"></div>
  </div>

  <script>
    const textarea = document.getElementById('markdown');
    const preview = document.getElementById('preview');

    textarea.addEventListener('input', () => {
      preview.innerHTML = marked.parse(textarea.value);
    });
  </script>
</body>
</html>
```

---

## 8. Build and Deployment

### Local Development

```bash
# Build the site locally
python build.py

# Serve locally
python -m http.server --directory dist 8000

# Visit http://localhost:8000
```

### Deployment Process

1. **Create your tool** as `toolname.html` in the root directory
2. **Commit and push** to your branch
3. **Merge to main** - GitHub Actions will automatically:
   - Run `build.py` to generate the dist/ structure
   - Deploy to GitHub Pages

Your tool will be live at: `https://lepinkainen.github.io/tools/toolname/`

---

## 9. Best Practices

### Do's ✅

- **Use semantic HTML** - `<label>`, `<input>`, `<button>`, etc.
- **Leverage common.css** - Use existing classes before adding custom styles
- **Keep it simple** - One tool, one file, one purpose
- **Mobile-first** - Common.css handles this, but test on mobile
- **Handle errors** - Always catch and display errors gracefully
- **Add placeholders** - Help users understand expected input
- **Provide feedback** - Loading states, success messages, etc.

### Don'ts ❌

- **Don't duplicate CSS** - Use common.css classes
- **Don't require a build step** - Tools should work as standalone HTML
- **Don't use complex frameworks** - Keep it vanilla JavaScript
- **Don't forget accessibility** - Use labels, alt text, etc.
- **Don't make assumptions** - Validate input and handle edge cases

---

## 10. Testing Your Tool

### Manual Testing Checklist

- [ ] Works in Chrome, Firefox, Safari
- [ ] Responsive on mobile (test at 375px, 768px, 1920px)
- [ ] All buttons and inputs are accessible
- [ ] Error states display correctly
- [ ] Loading states work as expected
- [ ] Copy to clipboard functions work
- [ ] File uploads handle errors (if applicable)
- [ ] External API failures are handled gracefully (if applicable)

### Testing Locally

```bash
# Build and serve
python build.py
python -m http.server --directory dist 8000

# Open in browser
# Navigate to http://localhost:8000/toolname/
```

---

## 11. Examples from This Repository

| Tool | Pattern | Key Features |
|------|---------|-------------|
| `joiner.html` | Media processing | File upload, drag & drop, canvas rendering, video processing |

---

## 12. Quick Start Workflow

1. **Create your tool**:
   ```bash
   # Copy the template
   cp template.html mytool.html
   # Edit mytool.html
   ```

2. **Test locally**:
   ```bash
   python build.py
   python -m http.server --directory dist 8000
   ```

3. **Commit and deploy**:
   ```bash
   git add mytool.html
   git commit -m "Add mytool"
   git push
   ```

4. **Your tool is live!**
   Visit: `https://lepinkainen.github.io/tools/mytool/`

---

## Credits

This guide is adapted from [Simon Willison's excellent tools repository](https://github.com/simonw/tools) and his comprehensive [TOOLS_GUIDE.md](https://github.com/simonw/tools/blob/main/TOOLS_GUIDE.md). The patterns and conventions documented here are largely inspired by his work. Thank you, Simon!

**Differences from Simon's setup:**
- We use a shared `common.css` instead of inline styles
- Our build process creates `dist/toolname/index.html` structure
- Tools link to `../common.css` instead of containing all styles

Visit [tools.simonwillison.net](https://tools.simonwillison.net) to see Simon's original implementation with 200+ tools!
