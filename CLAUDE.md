# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of single-page browser-based tools inspired by [Simon Willison's tools](https://tools.simonwillison.net). Each tool is a self-contained HTML file with shared cyberpunk-themed styling. The project is designed for rapid prototyping of simple utilities that run entirely in the browser.

**Live site**: https://lepinkainen.github.io/tools/

## Architecture

### Build System
- **Source**: Individual `.html` files in the root directory (e.g., `joiner.html`, `make-collage.html`)
- **Build script**: `build.py` - scans root for `.html` files, creates `dist/` structure
- **Index page**: Generated from `static/index.template.html` using Python's `string.Template`
- **Output**: Each tool becomes `dist/toolname/index.html` with an auto-generated index page
- **Deployment**: GitHub Actions automatically builds and deploys to GitHub Pages on push to `main`

### Styling System
- **Shared stylesheet**: `static/common.css` - cyberpunk theme with Share Tech Mono font, neon effects
- **CSS linking**: Tools reference `../static/common.css` from their subdirectories
- **Theme**: Dark purple gradient background, magenta (#ff1493) and cyan (#00d9ff) neon accents
- **Responsive**: Mobile-first design built into common styles

### Tool Structure
Each tool is a single HTML file containing:
- HTML structure using semantic elements
- Link to `../static/common.css` for base styling
- Optional `<style>` block for tool-specific CSS
- Inline `<script>` for functionality (vanilla JavaScript)
- No build dependencies, no frameworks

## Common Commands

### Build and Test Locally
```bash
# Build the site
python build.py

# Serve locally
python -m http.server --directory dist 8000

# Access at http://localhost:8000
```

### Adding a New Tool
1. Create `toolname.html` in the root directory
2. Include `<link rel="stylesheet" href="../static/common.css" />` in `<head>`
3. Use common CSS classes (`.container`, `.box`, `.output`, etc.)
4. Test with `python build.py` and local server
5. Commit and push - GitHub Actions deploys automatically

Tool will be live at: `https://lepinkainen.github.io/tools/toolname/`

## CSS Classes Reference

### Layout
- `.container` - Centered content wrapper (max-width: 1200px)
- `.box` - Dashed border box with hover effects (for drop zones, inputs)
- `.output` - Output/result display area with subtle background

### Buttons
- `button` - Primary button (green border, transparent background)
- `button.secondary` - Secondary button (cyan border)
- `button:disabled` - Disabled state (50% opacity)

### Utility Classes
- `.text-left`, `.text-center` - Text alignment
- `.mt-1`, `.mt-2`, `.mt-3` - Margin top (10px, 20px, 30px)
- `.mb-1`, `.mb-2`, `.mb-3` - Margin bottom (10px, 20px, 30px)

### Form Elements
All inputs, textareas, and selects are pre-styled with the cyberpunk theme.

## Tool Development Patterns

### File Upload with Drag & Drop
```javascript
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
});
```

### Canvas-based Image/Video Processing
See `joiner.html` for comprehensive example of:
- Loading images and videos into canvas
- Handling different aspect ratios
- Side-by-side rendering
- Video frame extraction and re-encoding
- FFmpeg.js integration for video processing

### Error Handling
```javascript
function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function hideError() {
  document.getElementById("error").style.display = "none";
}
```

## External Libraries

Load libraries from CDNs when needed:

```html
<!-- Marked (Markdown) -->
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>

<!-- FFmpeg.js (Video processing) -->
<script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js"></script>

<!-- PDF.js, Tesseract.js, Chart.js, etc. available via jsDelivr -->
```

## Key Implementation Notes

### MediaJoiner (`joiner.html`)
- Joins two images or videos side-by-side
- Uses Canvas API for image joining
- Uses FFmpeg.js for video processing (loaded on-demand)
- Handles mixed media types (image+video, video+video)
- Provides swap, clear, and regenerate functionality

### Make Collage (`make-collage.html`)
- Creates grid-based collages from multiple images
- Configurable rows, columns, spacing, padding
- Real-time preview with Canvas API
- Drag and drop multiple file support

## Best Practices

### Do's
- Keep tools self-contained in a single HTML file
- Use common.css classes before adding custom styles
- Handle errors gracefully with user-friendly messages
- Provide loading states for async operations
- Test on mobile (responsive design is built-in)
- Add placeholders to help users understand expected input

### Don'ts
- Don't duplicate CSS - leverage common.css
- Don't require build steps for the tool itself
- Don't use complex frameworks - vanilla JS only
- Don't forget to link `../common.css` in the head
- Don't skip error handling for file operations

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Runs `python build.py` to generate `dist/`
2. Uploads `dist/` as artifact
3. Deploys to GitHub Pages

Triggered on:
- Push to `main` branch
- Manual workflow dispatch
