import { isLlmConfigured, llm } from "@/lib/env";

/**
 * Klien minimal untuk endpoint yang kompatibel OpenAI Chat Completions.
 * Sengaja tipis: app harus tetap jalan penuh tanpa LLM sama sekali
 * (checklist Tier A + narasi berbasis aturan).
 */

export type ChatMessage = { role: "system" | "user"; content: string };

export type ChatOptions = {
  temperature?: number;
  /** Paksa output JSON valid (JSON mode) — dipakai untuk generate Tier B. */
  json?: boolean;
  maxTokens?: number;
  timeoutMs?: number;
};

export class LlmUnavailableError extends Error {}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  if (!isLlmConfigured()) {
    throw new LlmUnavailableError("LLM_API_KEY belum diisi");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 60_000);

  try {
    const response = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${llm.apiKey}`,
      },
      body: JSON.stringify({
        model: llm.model,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2_000,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`LLM ${response.status}: ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Balasan LLM kosong");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/** Ambil objek JSON pertama dari balasan, tahan terhadap pagar ```json. */
export function parseJsonObject(raw: string): unknown {
  const cleaned = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Tidak ada objek JSON di balasan LLM");
  return JSON.parse(cleaned.slice(start, end + 1));
}
