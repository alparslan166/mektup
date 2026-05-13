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

function buildResultUrl(req: Request, input: ReturnPayload) {
  const status = normalizeStatus(input.status);
  const order = pickFirstString(input.order, input.orderNumber);
  const conversationId = pickFirstString(
    input.conversationId,
    input.conversationID,
  );
  const token = pickFirstString(input.token, input.Token);

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
    };
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  const query = fromSearchParams(req);
  const target = buildResultUrl(req, query);
  return NextResponse.redirect(target, 302);
}

export async function POST(req: Request) {
  const query = fromSearchParams(req);
  const body = await fromBody(req);
  const target = buildResultUrl(req, {
    status: body.status || query.status,
    order: body.order || query.order,
    orderNumber: body.orderNumber || query.orderNumber,
    conversationId: body.conversationId || query.conversationId,
    conversationID: body.conversationID || query.conversationID,
    token: body.token || query.token,
    Token: body.Token || query.Token,
  });

  return NextResponse.redirect(target, 303);
}
