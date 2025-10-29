# Tools

A collection of simple browser-based tools, inspired by [Simon Willison's tools](https://tools.simonwillison.net).

## Live Site

The tools are deployed at: https://lepinkainen.github.io/tools/

## How It Works

1. **Tools**: Each tool is a single HTML file in the root directory (e.g., `joiner.html`)
2. **Styling**: All tools share a common stylesheet (`common.css`) for consistent appearance
3. **Build Process**: The `build.py` script:
   - Scans for all `.html` files in the root directory
   - Creates a `dist/` directory structure
   - Deploys each tool to `dist/toolname/index.html`
   - Generates an index page listing all available tools
4. **Deployment**: GitHub Actions automatically builds and deploys to GitHub Pages on every push to main

## Setup GitHub Actions

To enable automatic deployment, you need to create the GitHub Actions workflow file manually. Create `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Build site
        run: python build.py

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Then:
1. Go to your repository settings on GitHub
2. Navigate to Settings → Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. Commit and push the workflow file - it will automatically deploy on every push to the main branch

## Adding a New Tool

1. Create a new HTML file in the root directory (e.g., `mytool.html`)
2. Link to the common stylesheet in the `<head>`:
   ```html
   <link rel="stylesheet" href="../common.css" />
   ```
3. Use the common CSS classes for consistent styling (see `common.css`)
4. Commit and push - GitHub Actions will automatically deploy it!

Your tool will be available at: `https://lepinkainen.github.io/tools/mytool/`

## Local Development

To build the site locally:

```bash
python build.py
```

The built site will be in the `dist/` directory. You can serve it locally with:

```bash
python -m http.server --directory dist 8000
```

Then visit http://localhost:8000

## CSS Classes

The common stylesheet provides these ready-to-use classes:

- `.container` - Centered content container
- `.box` - Bordered box with hover effects
- `.output` - Output/result display area
- `.secondary` - Secondary button style
- Utility classes: `.text-left`, `.text-center`, `.mt-*`, `.mb-*`

See `common.css` for all available styles.

## License

MIT
