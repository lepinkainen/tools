/**
 * Graphics utilities for adding cyberpunk SVG enhancements to tools
 * Usage: Include this script and graphics.svg in your HTML, then call the functions below
 */

// Load the SVG sprite sheet
function loadSVGSprites() {
  if (document.getElementById("svg-sprites")) {
    return; // Already loaded
  }

  fetch("../static/graphics.svg")
    .then((response) => response.text())
    .then((svgContent) => {
      const div = document.createElement("div");
      div.id = "svg-sprites";
      div.style.display = "none";
      div.innerHTML = svgContent;
      document.body.insertBefore(div, document.body.firstChild);
    })
    .catch((err) => console.error("Failed to load SVG sprites:", err));
}

// Add circuit corner decorations to a box element
function addCircuitCorners(element) {
  if (!element || element.querySelector(".circuit-corner")) {
    return; // Already has corners or invalid element
  }

  element.classList.add("box-with-circuits");

  const corners = ["tl", "tr", "bl", "br"];
  corners.forEach((position) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("circuit-corner", position);
    svg.setAttribute("viewBox", "0 0 60 60");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      `#circuit-corner-${position}`
    );
    svg.appendChild(use);

    element.appendChild(svg);
  });
}

// Add circuit corners to all boxes on the page
function addCircuitCornersToAllBoxes() {
  const boxes = document.querySelectorAll(".box");
  boxes.forEach((box) => addCircuitCorners(box));
}

// Create a loading spinner
function createLoadingSpinner() {
  const container = document.createElement("div");
  container.classList.add("loading-spinner");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 50 50");

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "href",
    "#loading-spinner"
  );
  svg.appendChild(use);

  container.appendChild(svg);
  return container;
}

// Show loading overlay with spinner
function showLoading(message = "") {
  hideLoading(); // Remove any existing overlay

  const overlay = document.createElement("div");
  overlay.id = "loading-overlay";
  overlay.classList.add("loading-overlay");

  const spinner = createLoadingSpinner();
  overlay.appendChild(spinner);

  if (message) {
    const text = document.createElement("p");
    text.textContent = message;
    text.style.marginTop = "20px";
    text.style.color = "#00d9ff";
    overlay.appendChild(text);
  }

  document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Add scan lines overlay to page
function addScanLines() {
  if (document.querySelector(".scan-lines-overlay")) {
    return; // Already added
  }

  const overlay = document.createElement("div");
  overlay.classList.add("scan-lines-overlay");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "none");

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#scan-lines");
  svg.appendChild(use);

  overlay.appendChild(svg);
  document.body.appendChild(overlay);
}

// Add a glitch divider element
function createGlitchDivider() {
  const divider = document.createElement("div");
  divider.classList.add("glitch-divider");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 400 20");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.style.width = "100%";
  svg.style.height = "100%";

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#glitch-divider");
  svg.appendChild(use);

  divider.appendChild(svg);
  return divider;
}

// Add terminal prompt icon before headings
function addPromptIcons(selector = "h2") {
  const headings = document.querySelectorAll(selector);
  headings.forEach((heading) => {
    if (heading.querySelector(".prompt-icon")) {
      return; // Already has icon
    }

    const icon = document.createElement("span");
    icon.classList.add("prompt-icon");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 20 20");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      "#prompt-chevron"
    );
    svg.appendChild(use);

    icon.appendChild(svg);
    heading.insertBefore(icon, heading.firstChild);
  });
}

// Add data stream background
function addDataStream(particleCount = 20) {
  if (document.querySelector(".data-stream")) {
    return; // Already added
  }

  const container = document.createElement("div");
  container.classList.add("data-stream");

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("data-particle");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 10 10");
    svg.style.width = "100%";
    svg.style.height = "100%";

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      "#data-particle"
    );
    svg.appendChild(use);

    particle.appendChild(svg);

    // Random positioning and animation delay
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${8 + Math.random() * 4}s`;

    container.appendChild(particle);
  }

  document.body.insertBefore(container, document.body.firstChild);
}

// Add tool icon to an element
function addToolIcon(element, iconId) {
  const icon = document.createElement("span");
  icon.classList.add("tool-icon");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 40 40");

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${iconId}`);
  svg.appendChild(use);

  icon.appendChild(svg);
  element.insertBefore(icon, element.firstChild);
}

// Initialize all graphics enhancements (call this on DOMContentLoaded)
function initGraphics(options = {}) {
  const defaults = {
    circuits: true,
    scanLines: false, // Disabled by default (can be visually busy)
    dataStream: false, // Disabled by default (can be visually busy)
    promptIcons: false, // Disabled by default (let tools opt-in)
    particleCount: 20,
  };

  const config = { ...defaults, ...options };

  loadSVGSprites();

  // Wait a bit for sprites to load
  setTimeout(() => {
    if (config.circuits) {
      addCircuitCornersToAllBoxes();
    }
    if (config.scanLines) {
      addScanLines();
    }
    if (config.dataStream) {
      addDataStream(config.particleCount);
    }
    if (config.promptIcons) {
      addPromptIcons("h2");
    }
  }, 100);
}

// Export functions for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadSVGSprites,
    addCircuitCorners,
    addCircuitCornersToAllBoxes,
    createLoadingSpinner,
    showLoading,
    hideLoading,
    addScanLines,
    createGlitchDivider,
    addPromptIcons,
    addDataStream,
    addToolIcon,
    initGraphics,
  };
}
