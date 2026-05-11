import crypto from "crypto";

type MorparaConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  apiKey: string;
  grantType: string;
  scope: string;
  merchantId: string;
  secretKey: string;
};

type MorparaHeaders = {
  "x-ClientID": string;
  "x-ClientSecret": string;
  "x-GrantType": string;
  "x-Scope": string;
  "x-Timestamp": string;
};

type HostedPaymentInput = {
  returnUrl: string;
  failUrl: string;
  conversationId: string;
  amount: string;
  currencyCode?: string;
  installmentCount?: number;
  language?: string;
};

type CheckPaymentInput = {
  conversationId: string;
};

type MorparaEnvDiagnostics = {
  hasBaseUrl: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasApiKey: boolean;
  hasMerchantId: boolean;
  hasSecretKey: boolean;
  baseUrl: string;
  scope: string;
  grantType: string;
  timestampFormat: string;
  timestampHourMode: string;
  headerSecretMode: string;
  clientIdMask: string;
  merchantIdMask: string;
  clientSecretFingerprint: string;
  apiKeyFingerprint: string;
};

function getEnvOptional(name: string): string {
  return process.env[name]?.trim() || "";
}

function maskEnvValue(value: string) {
  if (!value) return "";
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function fingerprintEnvValue(value: string) {
  if (!value) return "";
  return crypto
    .createHash("sha256")
    .update(value, "utf8")
    .digest("hex")
    .slice(0, 12);
}

function normalizeMorparaScope(value: string) {
  return value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not configured`);
  }

  return value.trim();
}

export function getMorparaEnvDiagnostics(): MorparaEnvDiagnostics {
  const baseUrl = getEnvOptional("MORPARA_BASE_URL");
  const clientId = getEnvOptional("MORPARA_CLIENT_ID");
  const clientSecret = getEnvOptional("MORPARA_CLIENT_SECRET");
  const apiKey = getEnvOptional("MORPARA_API_KEY");
  const merchantId = getEnvOptional("MORPARA_MERCHANT_ID");
  const secretKey = getEnvOptional("MORPARA_SECRET_KEY");
  const scope = normalizeMorparaScope(
    getEnvOptional("MORPARA_SCOPE") || "pf_write,pf_read",
  );
  const grantType =
    getEnvOptional("MORPARA_GRANT_TYPE") || "client_credentials";
  const timestampFormat =
    getEnvOptional("MORPARA_TIMESTAMP_FORMAT").toLowerCase() || "iso";
  const timestampHourMode =
    getEnvOptional("MORPARA_TIMESTAMP_HOUR_MODE") || "12";
  const headerSecretMode =
    getEnvOptional("MORPARA_HEADER_SECRET_MODE") || "hash";

  return {
    hasBaseUrl: baseUrl.length > 0,
    hasClientId: clientId.length > 0,
    hasClientSecret: clientSecret.length > 0,
    hasApiKey: apiKey.length > 0,
    hasMerchantId: merchantId.length > 0,
    hasSecretKey: secretKey.length > 0,
    baseUrl,
    scope,
    grantType,
    timestampFormat,
    timestampHourMode,
    headerSecretMode,
    clientIdMask: maskEnvValue(clientId),
    merchantIdMask: maskEnvValue(merchantId),
    clientSecretFingerprint: fingerprintEnvValue(clientSecret),
    apiKeyFingerprint: fingerprintEnvValue(apiKey),
  };
}

export function getMorparaConfig(): MorparaConfig {
  const rawScope = process.env.MORPARA_SCOPE?.trim() || "pf_write pf_read";

  return {
    baseUrl: getEnv("MORPARA_BASE_URL"),
    clientId: getEnv("MORPARA_CLIENT_ID"),
    clientSecret: getEnv("MORPARA_CLIENT_SECRET"),
    apiKey: getEnv("MORPARA_API_KEY"),
    grantType: process.env.MORPARA_GRANT_TYPE?.trim() || "client_credentials",
    scope: normalizeMorparaScope(rawScope),
    merchantId: getEnv("MORPARA_MERCHANT_ID"),
    secretKey: getEnv("MORPARA_SECRET_KEY"),
  };
}

function formatCompactMorparaTimestamp(date = new Date()) {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hourMode = process.env.MORPARA_TIMESTAMP_HOUR_MODE?.trim();
  const rawHours = date.getHours();
  const hoursValue = hourMode === "24" ? rawHours : rawHours % 12 || 12;
  const hours = String(hoursValue).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function formatMorparaTimestamp(date = new Date()) {
  const mode = process.env.MORPARA_TIMESTAMP_FORMAT?.trim().toLowerCase();
  if (mode === "compact") {
    return formatCompactMorparaTimestamp(date);
  }

  return date.toISOString();
}

function buildHeaderClientSecret(clientSecret: string, timestamp: string) {
  const mode = process.env.MORPARA_HEADER_SECRET_MODE?.trim() || "hash";
  if (mode === "raw") {
    return clientSecret;
  }

  // Morpara reference (CryptoJS):
  //   decoded = Base64Decode(clientSecret) as UTF-8 string
  //   combined = decoded + xTimestamp
  //   hashHex = SHA256(combined).toString(Hex)            // 64 lowercase hex chars
  //   xClientSecret = Base64( UTF-8 bytes of hashHex )    // base64 of the hex string
  const decodedSecret = Buffer.from(clientSecret, "base64").toString("utf8");
  const combined = `${decodedSecret}${timestamp}`;
  const sha256Hex = crypto
    .createHash("sha256")
    .update(combined, "utf8")
    .digest("hex");
  return Buffer.from(sha256Hex, "utf8").toString("base64");
}

function hashSha256Base64Upper(value: string) {
  return crypto
    .createHash("sha256")
    .update(value, "utf8")
    .digest("base64")
    .toUpperCase();
}

function generateConversationMerchantApiKeySign(
  conversationId: string,
  merchantId: string,
) {
  const config = getMorparaConfig();
  const canonical = `${conversationId};${merchantId};${config.apiKey}`;
  return hashSha256Base64Upper(canonical);
}

export function getMorparaHeaders(timestamp?: string): MorparaHeaders {
  const config = getMorparaConfig();
  const xTimestamp = timestamp || formatMorparaTimestamp();

  return {
    "x-ClientID": config.clientId,
    "x-ClientSecret": buildHeaderClientSecret(config.clientSecret, xTimestamp),
    "x-GrantType": config.grantType,
    "x-Scope": config.scope,
    "x-Timestamp": xTimestamp,
  };
}

export function generateMorparaSign(
  parts: Array<string | number | undefined | null>,
) {
  const config = getMorparaConfig();
  const delimiter = process.env.MORPARA_SIGN_DELIMITER?.trim() || ";";
  const shouldAppendApiKey =
    process.env.MORPARA_SIGN_APPEND_API_KEY?.trim() !== "false";

  const canonical = parts
    .map((part) =>
      part === undefined || part === null ? "" : String(part).trim(),
    )
    .join(delimiter);

  if (shouldAppendApiKey) {
    const apiKey = config.apiKey || config.secretKey;
    return hashSha256Base64Upper(`${canonical}${delimiter}${apiKey}`);
  }

  return hashSha256Base64Upper(canonical);
}

export function buildHostedPaymentPayload(input: HostedPaymentInput) {
  const config = getMorparaConfig();
  const currencyCode = input.currencyCode || "949";
  const installmentCount = input.installmentCount ?? 0;
  const language = input.language || "tr";
  const sign = generateConversationMerchantApiKeySign(
    input.conversationId,
    config.merchantId,
  );

  return {
    merchantId: config.merchantId,
    returnUrl: input.returnUrl,
    failUrl: input.failUrl,
    paymentMethod: "HOSTEDPAYMENT",
    paymentInstrumentType: "CARD",
    language,
    conversationId: input.conversationId,
    sign,
    transactionDetails: {
      transactionType: "SALE",
      installmentCount,
      amount: input.amount,
      currencyCode,
      vftFlag: false,
    },
  };
}

export function buildCheckPaymentPayload(input: CheckPaymentInput) {
  const config = getMorparaConfig();
  const sign = generateConversationMerchantApiKeySign(
    input.conversationId,
    config.merchantId,
  );

  return {
    merchantId: Number(config.merchantId),
    conversationId: input.conversationId,
    sign,
  };
}

export function getHostedPaymentRedirectUrl() {
  const config = getMorparaConfig();
  return `${config.baseUrl}/v1/HostedPayment/HostedPaymentRedirect`;
}

export function getCheckPaymentUrl() {
  const config = getMorparaConfig();
  return `${config.baseUrl}/v1/Payment/CheckPayment`;
}

function getStringField(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function getStringFieldCaseInsensitive(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const direct = getStringField(payload, key);
  if (direct) return direct;

  const lowerKey = key.toLowerCase();
  const matchedKey = Object.keys(payload).find(
    (currentKey) => currentKey.toLowerCase() === lowerKey,
  );

  if (!matchedKey) return null;
  return getStringField(payload, matchedKey);
}

function areEqualSafe(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyMorparaCallbackSign(payload: Record<string, unknown>) {
  const callbackSign = getStringFieldCaseInsensitive(payload, "sign");
  const enforce = process.env.MORPARA_CALLBACK_SIGN_ENFORCE !== "false";

  if (!callbackSign) {
    return {
      isValid: !enforce,
      reason: "Callback sign alanı bulunamadı.",
    };
  }

  const config = getMorparaConfig();
  const conversationId = getStringFieldCaseInsensitive(
    payload,
    "conversationId",
  );

  if (!conversationId) {
    return {
      isValid: !enforce,
      reason: "Callback conversationId alanı bulunamadı.",
    };
  }

  const merchantId =
    getStringFieldCaseInsensitive(payload, "merchantId") || config.merchantId;

  const expectedSign = generateConversationMerchantApiKeySign(
    conversationId,
    merchantId,
  );
  const normalizedCallbackSign = callbackSign.toUpperCase();

  return {
    isValid: areEqualSafe(normalizedCallbackSign, expectedSign),
    reason: "Callback sign doğrulaması başarısız.",
  };
}
