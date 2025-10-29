#!/usr/bin/env python3
"""
Build script for the tools site.

This script:
1. Scans for all .html files in the root directory (excluding index.html)
2. Creates a dist/ directory structure
3. For each tool, creates dist/toolname/index.html
4. Copies common.css to dist/
5. Generates an index page listing all tools
"""

import os
import re
import shutil
from pathlib import Path
from html.parser import HTMLParser


class TitleExtractor(HTMLParser):
    """Extract title from HTML"""
    def __init__(self):
        super().__init__()
        self.title = None
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title = data.strip()


def extract_title(html_content):
    """Extract title from HTML content"""
    parser = TitleExtractor()
    parser.feed(html_content)
    return parser.title or "Untitled Tool"


def get_tool_files():
    """Get all tool HTML files in the root directory"""
    tools = []
    for file in Path('.').glob('*.html'):
        # Skip index.html as it will be generated
        if file.name.lower() != 'index.html':
            tools.append(file)
    return sorted(tools)


def build_site():
    """Main build function"""
    print("Building tools site...")

    # Create dist directory
    dist_dir = Path('dist')
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir()

    # Copy common.css to dist root
    if Path('common.css').exists():
        shutil.copy('common.css', dist_dir / 'common.css')
        print("✓ Copied common.css")

    # Process each tool
    tools = get_tool_files()
    tool_info = []

    for tool_file in tools:
        # Get tool name (without .html extension)
        tool_name = tool_file.stem

        # Create tool directory
        tool_dir = dist_dir / tool_name
        tool_dir.mkdir()

        # Read tool HTML
        html_content = tool_file.read_text(encoding='utf-8')

        # Extract title
        title = extract_title(html_content)

        # Update CSS link if needed
        # Replace inline styles or add link to common.css if not already present
        if '<link rel="stylesheet" href="../common.css"' not in html_content and 'href="../common.css"' not in html_content:
            # Add link to common.css in the head
            html_content = html_content.replace(
                '</head>',
                '  <link rel="stylesheet" href="../common.css" />\n  </head>'
            )

        # Write to dist/toolname/index.html
        (tool_dir / 'index.html').write_text(html_content, encoding='utf-8')

        tool_info.append({
            'name': tool_name,
            'title': title,
            'path': f'{tool_name}/'
        })

        print(f"✓ Built {tool_name} ({title})")

    # Generate index page
    generate_index(dist_dir, tool_info)

    print(f"\n✓ Build complete! {len(tools)} tool(s) built.")
    print(f"Output directory: {dist_dir.absolute()}")


def generate_index(dist_dir, tool_info):
    """Generate the main index page"""
    index_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tools</title>
  <link rel="stylesheet" href="common.css" />
</head>
<body>
  <div class="container">
    <h1>Tools</h1>
    <p>A collection of simple browser-based tools</p>

    <ul class="text-left">
"""

    for tool in tool_info:
        index_html += f'      <li><a href="{tool["path"]}">{tool["title"]}</a></li>\n'

    index_html += """    </ul>

    <p class="mt-3">
      <a href="https://github.com/lepinkainen/tools" target="_blank">View source on GitHub</a>
    </p>
  </div>
</body>
</html>
"""

    (dist_dir / 'index.html').write_text(index_html, encoding='utf-8')
    print("✓ Generated index.html")


if __name__ == '__main__':
    build_site()
