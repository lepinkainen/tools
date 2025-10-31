# Tools Development Guide - LLM Reference

## CRITICAL REQUIREMENTS

- Single HTML file per tool in root directory
- Must link to `../static/common.css` in `<head>`
- Vanilla JavaScript only (no frameworks)
- Self-contained (inline styles/scripts)
- Mobile-responsive (handled by common.css)

## Repository Structure

```
/home/user/tools/
├── *.html              # Tool sources (root)
├── static/
│   ├── common.css      # Shared stylesheet
│   ├── graphics.js     # Visual enhancements
│   └── graphics.svg    # SVG symbols
├── build.py            # Generates dist/
└── dist/               # Build output
    ├── static/common.css
    ├── index.html
    └── toolname/index.html
```

Build process: `python build.py` → `dist/toolname/index.html`
Deployment: GitHub Actions auto-deploys to Pages on push to main
URL pattern: `https://lepinkainen.github.io/tools/toolname/`

## Tool Template (Minimal)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tool Name</title>
  <link rel="stylesheet" href="../static/common.css" />
</head>
<body>
  <div class="container">
    <h1>
      <svg class="tool-icon" viewBox="0 0 40 40" style="width: 50px; height: 50px">
        <g stroke="#00d9ff" stroke-width="2" fill="none">
          <rect x="5" y="5" width="30" height="30" />
        </g>
      </svg>
      Tool Name
    </h1>
    <p>Description</p>
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
      document.getElementById('output').textContent = `Result: ${input}`;
    }
  </script>
</body>
</html>
```

## CSS Classes (common.css)

### Layout

- `.container` - Max-width: 1200px, centered
- `.box` - Bordered container with hover effects (for drop zones, inputs)
- `.output` - Output display area

### Buttons

- `button` - Primary (green border)
- `button.secondary` - Secondary (cyan border)
- `button:disabled` - 50% opacity

### Spacing

- `.mt-1/.mt-2/.mt-3` - Margin top: 10/20/30px
- `.mb-1/.mb-2/.mb-3` - Margin bottom: 10/20/30px
- `.text-left/.text-center` - Text alignment

### Form Elements

Pre-styled: `input`, `textarea`, `select` (cyberpunk theme)

## SVG Icons (Required in h1)

**Standard attributes:**

```html
<svg class="tool-icon" viewBox="0 0 40 40" style="width: 50px; height: 50px">
  <g stroke="#00d9ff" stroke-width="2" fill="none">
    <!-- Geometric shapes: rect, circle, line -->
  </g>
</svg>
```

**Color palette:**

- Primary: `#00d9ff` (cyan) - main shapes
- Accent: `#ff1493` (magenta) - connections/highlights

**Design rules:**

- Simple geometric shapes only
- Stroke-based (fill="none")
- Use 0-40 coordinate space
- Visual metaphor for tool function

**Example patterns:**

```html
<!-- Join/Combine (two boxes + line) -->
<rect x="2" y="10" width="15" height="20" />
<rect x="23" y="10" width="15" height="20" />
<line x1="19" y1="20" x2="21" y2="20" stroke="#ff1493" stroke-width="3" />

<!-- Grid/Collage (2x2 grid) -->
<rect x="5" y="5" width="12" height="12" />
<rect x="23" y="5" width="12" height="12" />
<rect x="5" y="23" width="12" height="12" />
<rect x="23" y="23" width="12" height="12" />
```

## Graphics Enhancements (graphics.js)

**Initialize (add before `</body>`):**

```html
<script src="../static/graphics.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    initGraphics({
      circuits: true,      // Circuit corners on .box elements
      scanLines: false,    // CRT scan lines (use sparingly)
      dataStream: false,   // Floating particles (use sparingly)
      promptIcons: false,  // Chevrons on h2 (optional)
    });
  });
</script>
```

**Recommended config:** `circuits: true`, others `false` (default for most tools)

**Direct functions:**

```javascript
showLoading("Processing...");  // Show spinner overlay
hideLoading();                  // Hide spinner
addCircuitCorners(element);     // Add to specific element
createGlitchDivider();          // Decorative divider
```

## Code Patterns

### File Upload with Drag & Drop

```javascript
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
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    // Process: e.target.result
  };
  reader.readAsDataURL(file);
}
```

### Copy to Clipboard

```javascript
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
  }).catch(err => {
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

### Loading State

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

### Error Display

```javascript
function showError(message) {
  const output = document.getElementById('output');
  output.innerHTML = `<p style="color: #ff0000;">Error: ${message}</p>`;
  output.classList.add('visible');
}
```

### Real-time Input Processing

```javascript
const textArea = document.getElementById('text');
textArea.addEventListener('input', () => {
  const text = textArea.value;
  document.getElementById('charCount').textContent = text.length;
  document.getElementById('wordCount').textContent =
    text.trim() ? text.trim().split(/\s+/).length : 0;
});
```

### URL Hash Parameters

```javascript
function loadFromHash() {
  const match = window.location.hash.match(/data=([^&]+)/);
  if (match) {
    const data = decodeURIComponent(match[1]);
    document.getElementById('input').value = data;
    process();
  }
}
loadFromHash();
window.addEventListener('hashchange', loadFromHash);

function saveToHash(data) {
  window.location.hash = `data=${encodeURIComponent(data)}`;
}
```

### LocalStorage Persistence

```javascript
function saveState() {
  const state = {
    input: document.getElementById('input').value,
    options: getOptions()
  };
  localStorage.setItem('toolState', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('toolState');
  if (saved) {
    const state = JSON.parse(saved);
    document.getElementById('input').value = state.input;
    setOptions(state.options);
  }
}

document.getElementById('input').addEventListener('input', saveState);
window.addEventListener('DOMContentLoaded', loadState);
```

### Fetch External API

```javascript
async function loadExternalData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Load failed:', error);
    throw error;
  }
}
```

## External Libraries (CDN)

```html
<!-- Markdown -->
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>

<!-- PDF rendering -->
<script type="module">
  import pdfjsDist from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/+esm';
</script>

<!-- OCR -->
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>

<!-- SQLite WASM -->
<script type="module">
  import sqlite3InitModule from 'https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.46.1-build4/sqlite-wasm/jswasm/sqlite3.mjs';
</script>

<!-- Charts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<!-- FFmpeg (video processing) -->
<script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js"></script>
```

## Build & Deploy

**Local development:**

```bash
python build.py
python -m http.server --directory dist 8000
# Visit http://localhost:8000
```

**Deployment:**

1. Create `toolname.html` in root
2. Commit and push
3. Merge to main → auto-deploy via GitHub Actions
4. Live at: `https://lepinkainen.github.io/tools/toolname/`

## Requirements Checklist

**Must have:**

- [ ] Link to `../static/common.css`
- [ ] SVG icon in h1 with `class="tool-icon"`
- [ ] Use `.container`, `.box`, `.output` classes
- [ ] Error handling for all operations
- [ ] Loading states for async operations
- [ ] Input validation
- [ ] Accessibility (labels, alt text)

**Must not:**

- [ ] Duplicate CSS (use common.css classes)
- [ ] Require build steps for tool itself
- [ ] Use frameworks (vanilla JS only)
- [ ] Assume input validity

**Testing:**

- [ ] Chrome, Firefox, Safari compatibility
- [ ] Mobile responsive (375px, 768px, 1920px)
- [ ] All interactive elements accessible
- [ ] Error states display correctly
- [ ] File upload error handling (if applicable)

## Reference Examples

**Simple input/output:** URL encoder/decoder, text processor
**File processing:** Image tools, video tools (see `joiner.html`)
**Real-time:** Character counter, markdown preview
**API integration:** Gist viewer, data fetcher

Source: Adapted from Simon Willison's tools repository
