import { writeFileSync } from "fs";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const url = "https://www.amazon.com/s?k=birthday+gift+for+him";
const res = await fetch(url, { headers: HEADERS });
const html = await res.text();

// Save first 50KB of HTML for inspection
writeFileSync("/workspace/scripts/amazon-sample.html", html.substring(0, 50000));

// Extract a sample product card
const cardStart = html.indexOf('data-component-type="s-search-result"');
if (cardStart > -1) {
  // Find the surrounding div
  const divStart = html.lastIndexOf("<div", cardStart);
  const divEnd = html.indexOf("</div>", cardStart + 5000); // look further ahead
  const sampleCard = html.substring(divStart, Math.min(divEnd + 10, divStart + 10000));
  writeFileSync("/workspace/scripts/amazon-card-sample.html", sampleCard);
  console.log("Saved sample card, length:", sampleCard.length);
} else {
  console.log("No product cards found in HTML");
  // Check for CAPTCHA
  if (html.includes("captcha") || html.includes("robot")) {
    console.log("CAPTCHA/bot detection detected!");
  }
  console.log("HTML length:", html.length);
  console.log("First 2000 chars:", html.substring(0, 2000));
}
