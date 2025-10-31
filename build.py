#!/usr/bin/env python3
"""
Build script for the tools site.

This script:
1. Scans for all .html files in the root directory (excluding index.html)
2. Creates a dist/ directory structure
3. Copies the static/ directory to dist/static/
4. For each tool, creates dist/toolname/index.html
5. Generates an index page from static/index.template.html
"""

import shutil
from pathlib import Path
from html.parser import HTMLParser
from string import Template


class TitleExtractor(HTMLParser):
    """Extract title from HTML"""

    def __init__(self):
        super().__init__()
        self.title = None
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
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
    for file in Path(".").glob("*.html"):
        # Skip index.html as it will be generated
        if file.name.lower() != "index.html":
            tools.append(file)
    return sorted(tools)


def build_site():
    """Main build function"""
    print("Building tools site...")

    # Create dist directory
    dist_dir = Path("dist")
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir()

    # Copy static directory to dist
    static_src = Path("static")
    if static_src.exists():
        static_dst = dist_dir / "static"
        shutil.copytree(static_src, static_dst)
        print("✓ Copied static/ directory")

        # If a favicon exists inside static/, also copy it to the site root (dist/) so
        # browsers can fetch it from /favicon.ico. Support common names.
        for fav_name in ("favicon.ico", "favicon.png", "favicon.svg"):
            fav_src = static_src / fav_name
            if fav_src.exists():
                shutil.copy2(fav_src, dist_dir / fav_name)
                print(f"✓ Copied {fav_name} to dist/")

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
        html_content = tool_file.read_text(encoding="utf-8")

        # Extract title
        title = extract_title(html_content)

        # Update CSS link to point to static directory
        html_content = html_content.replace(
            'href="../common.css"', 'href="../static/common.css"'
        )

        # Add link if not already present
        if 'href="../static/common.css"' not in html_content:
            html_content = html_content.replace(
                "</head>",
                '  <link rel="stylesheet" href="../static/common.css" />\n  </head>',
            )

        # Ensure each tool page references the site favicon at the root. If there's
        # already an icon link, skip insertion.
        if 'rel="icon"' not in html_content and "rel=icon" not in html_content:
            html_content = html_content.replace(
                "</head>", '  <link rel="icon" href="../favicon.ico" />\n  </head>'
            )

        # Write to dist/toolname/index.html
        (tool_dir / "index.html").write_text(html_content, encoding="utf-8")

        tool_info.append({"name": tool_name, "title": title, "path": f"{tool_name}/"})

        print(f"✓ Built {tool_name} ({title})")

    # Generate index page
    generate_index(dist_dir, tool_info)

    print(f"\n✓ Build complete! {len(tools)} tool(s) built.")
    print(f"Output directory: {dist_dir.absolute()}")


def generate_index(dist_dir, tool_info):
    """Generate the main index page from template"""
    # Read the template
    template_path = Path("static/index.template.html")
    template_content = template_path.read_text(encoding="utf-8")

    # Generate tool list HTML
    tool_list_html = ""
    for tool in tool_info:
        tool_list_html += (
            f'      <li><a href="{tool["path"]}">{tool["title"]}</a></li>\n'
        )

    # Substitute the placeholder with the tool list
    template = Template(template_content)
    index_html = template.substitute(TOOL_LIST=tool_list_html)

    # Write the final index page
    (dist_dir / "index.html").write_text(index_html, encoding="utf-8")
    print("✓ Generated index.html from template")


if __name__ == "__main__":
    build_site()
