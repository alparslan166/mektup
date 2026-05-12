// Usage:
//   node scripts/find-morpara-sign-formula.mjs
// Reads MORPARA_* env vars from .env (loads automatically via dotenv).
// Tries every plausible canonical-string permutation against the expected
// SHA256 hash that Morpara revealed.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Minimal dotenv loader (no dependency).
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.replace(/^['"]|['"]$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}

const apiKey = process.env.MORPARA_API_KEY || "";
const secretKey = process.env.MORPARA_SECRET_KEY || "";
const clientSecret = process.env.MORPARA_CLIENT_SECRET || "";

if (!apiKey || !secretKey) {
  console.error("MORPARA_API_KEY / MORPARA_SECRET_KEY .env'de yok.");
  process.exit(1);
}

const expectedHex =
  "f616dfd9f782d5d847a68ce0c0fdb5c62898ca119b1c3b0f19b23cbd29e660bd";

const conversationId = "c5445eeb52f6a522d8c1";
const merchantId = "1000000094";
const amount = "240.00";
const currencyCode = "949";

const fields = {
  ConversationId: conversationId,
  MerchantId: merchantId,
  Amount: amount,
  CurrencyCode: currencyCode,
};

// SecretKey base64 decoded variant (Morpara x-ClientSecret pattern decodes
// clientSecret as UTF-8; secretKey may follow same convention).
let secretKeyDecoded = "";
try {
  secretKeyDecoded = Buffer.from(secretKey, "base64").toString("utf8");
} catch {}
let apiKeyDecoded = "";
try {
  apiKeyDecoded = Buffer.from(apiKey, "base64").toString("utf8");
} catch {}
let clientSecretDecoded = "";
try {
  clientSecretDecoded = Buffer.from(clientSecret, "base64").toString("utf8");
} catch {}

const keyCandidates = [
  ["apiKey", apiKey],
  ["secretKey", secretKey],
  ["clientSecret", clientSecret],
  ["secretKey_b64decoded", secretKeyDecoded],
  ["apiKey_b64decoded", apiKeyDecoded],
  ["clientSecret_b64decoded", clientSecretDecoded],
];

const delimiters = ["", ";", ",", "|", ":", "\n", "-", " ", "/"];

const fieldOrders = [
  ["ConversationId", "MerchantId"],
  ["MerchantId", "ConversationId"],
  ["ConversationId", "MerchantId", "Amount", "CurrencyCode"],
  ["MerchantId", "ConversationId", "Amount", "CurrencyCode"],
  ["ConversationId", "MerchantId", "Amount"],
  ["MerchantId", "ConversationId", "Amount"],
  ["ConversationId", "Amount", "CurrencyCode", "MerchantId"],
  ["MerchantId", "Amount", "CurrencyCode", "ConversationId"],
  ["Amount", "CurrencyCode", "ConversationId", "MerchantId"],
  ["Amount", "ConversationId", "MerchantId"],
  ["ConversationId", "MerchantId", "Amount", "CurrencyCode", "ReturnUrl", "FailUrl"],
];

const keyPositions = ["append", "prepend", "none_hmac"];

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}
function hmacSha256Hex(key, value) {
  return crypto
    .createHmac("sha256", key)
    .update(value, "utf8")
    .digest("hex");
}

let matches = [];
let tried = 0;

for (const order of fieldOrders) {
  for (const delim of delimiters) {
    const parts = order.map((k) => fields[k]);
    const canonical = parts.join(delim);

    for (const [keyName, keyVal] of keyCandidates) {
      if (!keyVal) continue;
      for (const pos of keyPositions) {
        tried++;
        let hash;
        let signature;
        if (pos === "append") {
          signature = canonical + delim + keyVal;
          hash = sha256Hex(signature);
        } else if (pos === "prepend") {
          signature = keyVal + delim + canonical;
          hash = sha256Hex(signature);
        } else {
          // HMAC mode
          signature = `HMAC(${keyName}, "${canonical}")`;
          hash = hmacSha256Hex(keyVal, canonical);
        }
        if (hash === expectedHex) {
          matches.push({
            order: order.join("+"),
            delimiter: JSON.stringify(delim),
            keyName,
            keyPosition: pos,
            canonicalPreview: signature.slice(0, 80) + (signature.length > 80 ? "..." : ""),
          });
        }
      }
    }
  }
}

console.log(`\nDenenen kombinasyon sayısı: ${tried}`);
if (matches.length === 0) {
  console.log("\n❌ Hiçbir kombinasyon eşleşmedi.");
  console.log("Denenmesi gereken başka değişken olabilir:");
  console.log(" - PaymentMethod / PaymentInstrumentType alanları sign'a dahil");
  console.log(" - Timestamp / başka bir secret");
  console.log(" - Farklı encoding (UTF-16 vb.)");
  console.log("Morpara'dan canonical string'i lütfen yazılı isteyin.");
} else {
  console.log(`\n✅ EŞLEŞEN ${matches.length} formül:\n`);
  for (const m of matches) {
    console.log(JSON.stringify(m, null, 2));
  }
}
