// One-time script to generate UPI QR code
// Run with: node scripts/generate-qr.mjs
import QRCode from "qrcode";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "..", "public");

mkdirSync(outputDir, { recursive: true });

const upiUrl = "upi://pay?pa=9160068402-3@ybl&pn=Vinayaka%20Vigrahalu&cu=INR";
const outputPath = join(outputDir, "upi-qr.png");

await QRCode.toFile(outputPath, upiUrl, {
  errorCorrectionLevel: "H",
  width: 400,
  margin: 2,
  color: {
    dark: "#1a1a2e",
    light: "#ffffff",
  },
});

console.log("✅ UPI QR code saved to:", outputPath);
