// Verify the A4 poster prints onto exactly one page in both orientations.
//
// Drives a real Chrome via puppeteer-core: synthesizes a test image into the
// page's file input, triggers Print A4, then renders the same print pipeline
// to a PDF buffer and asserts the result has exactly one page.
//
// Usage: node scripts/test-a4-print.mjs
// Requires: Google Chrome.app installed and a local HTTP server reachable.

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import puppeteer from "puppeteer-core";

const ROOT = new URL("..", import.meta.url).pathname;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 8791;
const URL_ = `http://127.0.0.1:${PORT}/a4-poster.html`;

function startServer() {
  const proc = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "ignore"],
  });
  return proc;
}

function countPdfPages(buffer) {
  // Page objects in a PDF carry "/Type /Page" (not /Pages). This is more
  // reliable than parsing /Count from the Pages root since Chrome inlines
  // page objects directly.
  const text = buffer.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page(?!s)/g);
  return matches ? matches.length : 0;
}

async function runOnce(browser, orientation) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("  page error:", e.message));
  await page.goto(URL_, { waitUntil: "domcontentloaded" });

  // Synthesize a 1500×2000 image and feed it through the page's drop handler.
  await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 1500;
    c.height = 2000;
    const cx = c.getContext("2d");
    const grad = cx.createLinearGradient(0, 0, 1500, 2000);
    grad.addColorStop(0, "#ff1493");
    grad.addColorStop(1, "#00d9ff");
    cx.fillStyle = grad;
    cx.fillRect(0, 0, 1500, 2000);
    cx.fillStyle = "#000";
    cx.font = "bold 200px sans-serif";
    cx.textAlign = "center";
    cx.fillText("A4 TEST", 750, 1000);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
    const file = new File([blob], "test.jpg", { type: "image/jpeg" });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.getElementById("fileInput");
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // Wait for editor to materialise.
  await page.waitForFunction(
    () => document.getElementById("editor").style.display === "grid",
    { timeout: 5000 },
  );

  // Switch orientation if needed.
  if (orientation === "landscape") {
    await page.evaluate(() => setOrientation("landscape"));
  }

  // Trigger the print flow. window.print() is a no-op under puppeteer; we
  // intercept it so the printImg/onload handler still wires up the @page
  // rule and image data URL.
  await page.evaluate(() => {
    window.__printed = false;
    const origPrint = window.print;
    window.print = () => {
      window.__printed = true;
    };
    printPoster();
  });

  // Wait for the print image and @page rule to be ready (printPoster calls
  // window.print inside the image's onload).
  await page.waitForFunction(() => window.__printed === true, { timeout: 8000 });

  // Snapshot the print pipeline.
  const pdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
  });

  const pages = countPdfPages(Buffer.from(pdf));
  await page.close();
  return pages;
}

async function main() {
  const server = startServer();
  // Give the server a beat to bind.
  await sleep(500);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox"],
  });

  let failed = 0;
  try {
    for (const orientation of ["portrait", "landscape"]) {
      process.stdout.write(`A4 ${orientation}: `);
      try {
        const pages = await runOnce(browser, orientation);
        if (pages === 1) {
          console.log(`OK (1 page)`);
        } else {
          console.log(`FAIL (${pages} pages)`);
          failed++;
        }
      } catch (e) {
        console.log(`ERROR — ${e.message}`);
        failed++;
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll print tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
