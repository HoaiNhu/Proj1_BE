// Script để generate JWT secrets mạnh cho production
// Chạy: node generate-secrets.js

const crypto = require("crypto");

console.log("🔐 Generating Strong JWT Secrets for Production\n");

const accessToken = crypto.randomBytes(64).toString("hex");
const refreshToken = crypto.randomBytes(64).toString("hex");

console.log("📋 Copy these to Render Environment Variables:\n");

console.log("ACCESS_TOKEN:");
console.log(accessToken);
console.log("");

console.log("REFRESH_TOKEN:");
console.log(refreshToken);
console.log("");

console.log("⚠️  IMPORTANT:");
console.log("1. Copy these values to Render Dashboard → Environment Variables");
console.log("2. DO NOT commit these to GitHub");
console.log(
  '3. DO NOT use the default "access_token" and "refresh_token" in production'
);
console.log("4. Save these somewhere safe (password manager)");
console.log("");

console.log("✅ Secrets generated successfully!");
