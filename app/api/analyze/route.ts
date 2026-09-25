import { NextRequest, NextResponse } from "next/server";
import {
  BillingParseError,
  parseBillingFile,
} from "@/lib/billing-parser";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_CONTENT_LENGTH = 400_000;
const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api"
).replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      content?: unknown;
      filename?: unknown;
      targetRegion?: unknown;
    };
    const content = typeof body.content === "string" ? body.content : "";
    const filename =
      typeof body.filename === "string" ? body.filename : "billing.csv";
    const targetRegion =
      typeof body.targetRegion === "string" ? body.targetRegion.trim() : undefined;

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo do arquivo é obrigatório." },
        { status: 400 },
      );
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 400 KB de texto." },
        { status: 413 },
      );
    }

    const billing = parseBillingFile(content, filename, targetRegion);
    const upstream = await fetch(
      `${BACKEND_API_URL}/billing/analyze/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(billing),
        cache: "no-store",
        signal: req.signal,
      },
    );

    if (!upstream.ok || !upstream.body) {
      const raw = await upstream.text();
      return NextResponse.json(
        {
          error: readBackendError(raw) || "O backend não conseguiu analisar o billing.",
        },
        { status: upstream.status || 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof BillingParseError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[analyze] Falha ao processar billing:", message);
    return NextResponse.json(
      {
        error:
          "Não foi possível conectar ao serviço de análise. Confirme se o backend está rodando na porta 3001.",
      },
      { status: 502 },
    );
  }
}

function readBackendError(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join("; ");
    return parsed.message ?? null;
  } catch {
    return raw.trim() || null;
  }
}
