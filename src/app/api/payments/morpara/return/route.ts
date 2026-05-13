import { NextResponse } from "next/server";

type ReturnStatus = "success" | "failed" | "processing";

type ReturnPayload = {
  status?: string;
  order?: string;
  orderNumber?: string;
  conversationId?: string;
  conversationID?: string;
  token?: string;
  Token?: string;
  paymentToken?: string;
  PaymentToken?: string;
};

function normalizeStatus(value: string | null | undefined): ReturnStatus {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "success") return "success";
  if (normalized === "failed") return "failed";
  return "processing";
}

function pickFirstString(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed.length > 0) return trimmed;
  }
  return undefined;
}

function maskLogValue(value: string | undefined) {
  if (!value) return undefined;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function extractPresentKeys(input: ReturnPayload) {
  return Object.entries(input)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key]) => key);
}

function resolveToken(input: ReturnPayload) {
  const entries: Array<[keyof ReturnPayload, string | undefined]> = [
    ["token", input.token],
    ["Token", input.Token],
    ["paymentToken", input.paymentToken],
    ["PaymentToken", input.PaymentToken],
  ];

  for (const [sourceKey, value] of entries) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed.length > 0) {
      return { value: trimmed, sourceKey };
    }
  }

  return { value: undefined, sourceKey: null };
}

function buildResultUrl(req: Request, input: ReturnPayload) {
  const status = normalizeStatus(input.status);
  const order = pickFirstString(input.order, input.orderNumber);
  const conversationId = pickFirstString(
    input.conversationId,
    input.conversationID,
  );
  const tokenResult = resolveToken(input);
  const token = tokenResult.value;

  const url = new URL("/odeme/sonuc", req.url);
  url.searchParams.set("status", status);
  if (order) {
    url.searchParams.set("order", order);
  }
  if (conversationId) {
    url.searchParams.set("conversationId", conversationId);
  }
  if (token) {
    url.searchParams.set("token", token);
  }

  return url;
}

function fromSearchParams(req: Request): ReturnPayload {
  const url = new URL(req.url);
  return {
    status: url.searchParams.get("status") || undefined,
    order: url.searchParams.get("order") || undefined,
    orderNumber: url.searchParams.get("orderNumber") || undefined,
    conversationId: url.searchParams.get("conversationId") || undefined,
    conversationID: url.searchParams.get("conversationID") || undefined,
    token: url.searchParams.get("token") || undefined,
    Token: url.searchParams.get("Token") || undefined,
    paymentToken: url.searchParams.get("paymentToken") || undefined,
    PaymentToken: url.searchParams.get("PaymentToken") || undefined,
  };
}

async function fromBody(req: Request): Promise<ReturnPayload> {
  const contentType = req.headers.get("content-type")?.toLowerCase() || "";

  if (contentType.includes("application/json")) {
    try {
      const payload = (await req.json()) as Record<string, unknown>;
      return {
        status: typeof payload.status === "string" ? payload.status : undefined,
        order: typeof payload.order === "string" ? payload.order : undefined,
        orderNumber:
          typeof payload.orderNumber === "string"
            ? payload.orderNumber
            : undefined,
        conversationId:
          typeof payload.conversationId === "string"
            ? payload.conversationId
            : undefined,
        conversationID:
          typeof payload.conversationID === "string"
            ? payload.conversationID
            : undefined,
        token: typeof payload.token === "string" ? payload.token : undefined,
        Token: typeof payload.Token === "string" ? payload.Token : undefined,
        paymentToken:
          typeof payload.paymentToken === "string"
            ? payload.paymentToken
            : undefined,
        PaymentToken:
          typeof payload.PaymentToken === "string"
            ? payload.PaymentToken
            : undefined,
      };
    } catch {
      return {};
    }
  }

  try {
    const form = await req.formData();
    return {
      status: form.get("status")?.toString(),
      order: form.get("order")?.toString(),
      orderNumber: form.get("orderNumber")?.toString(),
      conversationId: form.get("conversationId")?.toString(),
      conversationID: form.get("conversationID")?.toString(),
      token: form.get("token")?.toString(),
      Token: form.get("Token")?.toString(),
      paymentToken: form.get("paymentToken")?.toString(),
      PaymentToken: form.get("PaymentToken")?.toString(),
    };
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  const query = fromSearchParams(req);
  const resolvedToken = resolveToken(query);
  console.info("MORPARA_RETURN_BRIDGE_GET", {
    inputChannel: "query",
    presentKeys: extractPresentKeys(query),
    order: query.order || query.orderNumber || null,
    conversationId: query.conversationId || query.conversationID || null,
    tokenSource: resolvedToken.sourceKey,
    tokenMask: maskLogValue(resolvedToken.value),
  });
  const target = buildResultUrl(req, query);
  return NextResponse.redirect(target, 302);
}

export async function POST(req: Request) {
  const query = fromSearchParams(req);
  const body = await fromBody(req);
  const merged: ReturnPayload = {
    status: body.status || query.status,
    order: body.order || query.order,
    orderNumber: body.orderNumber || query.orderNumber,
    conversationId: body.conversationId || query.conversationId,
    conversationID: body.conversationID || query.conversationID,
    token: body.token || query.token,
    Token: body.Token || query.Token,
    paymentToken: body.paymentToken || query.paymentToken,
    PaymentToken: body.PaymentToken || query.PaymentToken,
  };
  const resolvedToken = resolveToken(merged);
  console.info("MORPARA_RETURN_BRIDGE_POST", {
    inputChannel: "body+query",
    queryPresentKeys: extractPresentKeys(query),
    bodyPresentKeys: extractPresentKeys(body),
    mergedPresentKeys: extractPresentKeys(merged),
    order: merged.order || merged.orderNumber || null,
    conversationId: merged.conversationId || merged.conversationID || null,
    tokenSource: resolvedToken.sourceKey,
    tokenMask: maskLogValue(resolvedToken.value),
  });
  const target = buildResultUrl(req, {
    status: merged.status,
    order: merged.order,
    orderNumber: merged.orderNumber,
    conversationId: merged.conversationId,
    conversationID: merged.conversationID,
    token: merged.token,
    Token: merged.Token,
    paymentToken: merged.paymentToken,
    PaymentToken: merged.PaymentToken,
  });

  return NextResponse.redirect(target, 303);
}
