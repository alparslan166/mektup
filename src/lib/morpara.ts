import crypto from "crypto";

type MorparaConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  apiKey?: string;
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

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not configured`);
  }

  return value.trim();
}

export function getMorparaConfig(): MorparaConfig {
  return {
    baseUrl: getEnv("MORPARA_BASE_URL"),
    clientId: getEnv("MORPARA_CLIENT_ID"),
    clientSecret: getEnv("MORPARA_CLIENT_SECRET"),
    apiKey: process.env.MORPARA_API_KEY?.trim() || undefined,
    grantType: process.env.MORPARA_GRANT_TYPE?.trim() || "client_credentials",
    scope: process.env.MORPARA_SCOPE?.trim() || "pf_write, pf_read",
    merchantId: getEnv("MORPARA_MERCHANT_ID"),
    secretKey: getEnv("MORPARA_SECRET_KEY"),
  };
}

function formatMorparaTimestamp(date = new Date()) {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function decodeBase64IfPossible(value: string) {
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return decoded || value;
  } catch {
    return value;
  }
}

function buildHeaderClientSecret(clientSecret: string, timestamp: string) {
  const mode = process.env.MORPARA_HEADER_SECRET_MODE?.trim() || "hash";
  if (mode === "raw") {
    return clientSecret;
  }

  const decodedSecret = decodeBase64IfPossible(clientSecret);
  const combined = `${decodedSecret}${timestamp}`;
  const shaHex = crypto.createHash("sha256").update(combined).digest("hex");
  return Buffer.from(shaHex, "utf8").toString("base64");
}

function hashSha256Base64Upper(value: string) {
  return crypto
    .createHash("sha256")
    .update(value, "utf8")
    .digest("base64")
    .toUpperCase();
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

  const sign = generateMorparaSign([
    config.merchantId,
    input.conversationId,
    input.amount,
    currencyCode,
    input.returnUrl,
    input.failUrl,
  ]);

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
  const sign = generateMorparaSign([config.merchantId, input.conversationId]);

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

  return null;
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
  const callbackSign =
    getStringField(payload, "sign") || getStringField(payload, "Sign");
  const enforce = process.env.MORPARA_CALLBACK_SIGN_ENFORCE !== "false";

  if (!callbackSign) {
    return {
      isValid: !enforce,
      reason: "Callback sign alanı bulunamadı.",
    };
  }

  const configured = process.env.MORPARA_CALLBACK_SIGN_FIELDS?.trim();
  const signFields = configured
    ? configured
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [
        "conversationId",
        "orderId",
        "paymentId",
        "responseCode",
        "responseDescription",
      ];

  const signParts = signFields.map(
    (field) => getStringField(payload, field) || "",
  );
  const expectedSign = generateMorparaSign(signParts);
  const normalizedCallbackSign = callbackSign.toUpperCase();

  return {
    isValid: areEqualSafe(normalizedCallbackSign, expectedSign),
    reason: "Callback sign doğrulaması başarısız.",
  };
}
