// Verify MediaJoiner scales both images to a common height.
//
// Drives a real Chrome via puppeteer-core: synthesizes two images with
// different dimensions, feeds them through the page's file inputs, clicks
// Generate, then measures the resulting PNG for each height-match mode.
//
// Usage: node scripts/test-joiner-heights.mjs
// Requires: Google Chrome.app installed.

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import puppeteer from "puppeteer-core";

const ROOT = new URL("..", import.meta.url).pathname;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 8792;
const URL_ = `http://127.0.0.1:${PORT}/joiner.html`;

// A: 400×200 (2:1), B: 150×300 (1:2)
const A = { w: 400, h: 200 };
const B = { w: 150, h: 300 };

function startServer() {
  return spawn(
    "python3",
    ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"],
    { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] },
  );
}

async function runOnce(browser, mode) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("  page error:", e.message));
  await page.goto(URL_, { waitUntil: "domcontentloaded" });

  await page.evaluate(
    async (a, b) => {
      async function feed(inputId, w, h, color) {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const cx = c.getContext("2d");
        cx.fillStyle = color;
        cx.fillRect(0, 0, w, h);
        const blob = await new Promise((r) => c.toBlob(r, "image/png"));
        const file = new File([blob], `${inputId}.png`, { type: "image/png" });
        const dt = new DataTransfer();
        dt.items.add(file);
        const input = document.getElementById(inputId);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      await feed("fileInputA", a.w, a.h, "#ff1493");
      await feed("fileInputB", b.w, b.h, "#00d9ff");
    },
    A,
    B,
  );

  await page.waitForFunction(
    () =>
      document.getElementById("fileAStatus").textContent.startsWith("✓") &&
      document.getElementById("fileBStatus").textContent.startsWith("✓"),
    { timeout: 5000 },
  );

  await page.select("#heightMatch", mode);
  await page.evaluate(() => generate());

  await page.waitForFunction(
    () => document.querySelector("#output img") !== null,
    { timeout: 15000 },
  );

  const dims = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = document.querySelector("#output img").src;
      }),
  );

  await page.close();
  return dims;
}

function check(name, actual, expected) {
  const ok = actual.w === expected.w && actual.h === expected.h;
  console.log(
    `${name}: ${ok ? "OK" : "FAIL"} (${actual.w}×${actual.h}, expected ${expected.w}×${expected.h})`,
  );
  return ok ? 0 : 1;
}

async function main() {
  const server = startServer();
  await sleep(500);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox"],
  });

  let failed = 0;
  try {
    // shortest: both scaled to h=200 -> A 400×200, B 100×200
    failed += check("match shortest", await runOnce(browser, "shortest"), {
      w: 500,
      h: 200,
    });
    // tallest: both scaled to h=300 -> A 600×300, B 150×300
    failed += check("match tallest", await runOnce(browser, "tallest"), {
      w: 750,
      h: 300,
    });
    // none: native sizes, padded to the taller
    failed += check("keep original", await runOnce(browser, "none"), {
      w: A.w + B.w,
      h: 300,
    });
  } finally {
    await browser.close();
    server.kill();
  }

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll joiner height tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
