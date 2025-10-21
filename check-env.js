// Script để check environment variables
// Chạy: node check-env.js

require("dotenv").config();

const requiredEnvVars = [
  "PORT",
  "MONGO_DB",
  "ACCESS_TOKEN",
  "REFRESH_TOKEN",
  "CLOUD_NAME",
  "API_KEY",
  "API_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "PAYPAL_API_URL",
  "VIETQR_API_KEY",
  "VIETQR_CLIENT_ID",
  "BANK_BIN",
  "BANK_NAME",
  "BANK_ACCOUNT_NUMBER",
  "BANK_ACCOUNT_NAME",
  "FASTAPI_URL",
  "CAKE_DIFFUSION_API_URL",
  "GEMINI_API_KEY",
  "OPEN_API_KEY",
];

const optionalEnvVars = ["NODE_ENV"];

console.log("🔍 Checking Environment Variables...\n");

let missingVars = [];
let presentVars = [];

console.log("📋 Required Variables:");
requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    const value = process.env[varName];
    const maskedValue =
      value.length > 20
        ? value.substring(0, 15) + "..."
        : value.substring(0, 10) + "...";
    console.log(`  ✅ ${varName}: ${maskedValue}`);
    presentVars.push(varName);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    missingVars.push(varName);
  }
});

console.log("\n📋 Optional Variables:");
optionalEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: ${process.env[varName]}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (will use default)`);
  }
});

console.log("\n📊 Summary:");
console.log(`  Total required: ${requiredEnvVars.length}`);
console.log(`  Present: ${presentVars.length}`);
console.log(`  Missing: ${missingVars.length}`);

if (missingVars.length > 0) {
  console.log("\n❌ Missing variables:");
  missingVars.forEach((v) => console.log(`  - ${v}`));
  console.log("\n⚠️  Please add these to your .env file or Render dashboard!");
  process.exit(1);
} else {
  console.log("\n✅ All required environment variables are set!");
  process.exit(0);
}
