import "server-only";
import { z } from "zod";
import type { ClientBrief } from "@/lib/crm";

export const MASTER_PROMPT =
  "Actúa como estratega de marketing para una pyme en Perú. Usa únicamente la información confirmada del brief. " +
  "Si falta un dato, pregunta o márcalo como [POR CONFIRMAR]. Propón 12 contenidos distribuidos en 3 pilares; " +
  "para cada uno entrega objetivo, formato, idea visual, hook, copy, CTA y métrica. " +
  "No inventes precios, testimonios, resultados ni características del producto. " +
  "Señala riesgos de afirmaciones y derechos de imagen.";

const line = (k: string, v: string | null | undefined) => `- ${k}: ${v?.trim() || "[POR CONFIRMAR]"}`;

/** Brief en texto para el prompt. Excluye a propósito los accesos (access_notes): nunca van a un modelo. */
export function briefToText(clientName: string, service: string, b: ClientBrief | null) {
  return [
    `Cliente: ${clientName}`,
    `Servicio contratado: ${service}`,
    line("Sector", b?.sector),
    line("Público", b?.audience),
    line("Oferta", b?.offer),
    line("Tono", b?.tone),
    line("Diferenciadores", b?.differentiators),
    line("Ubicación", b?.location),
    line("CTA", b?.cta),
    line("Referencias visuales", b?.references_text),
    line("Restricciones", b?.restrictions),
  ].join("\n");
}

export function fullPrompt(briefText: string) {
  return `${MASTER_PROMPT}\n\nBRIEF\n${briefText}`;
}

export const itemSchema = z.object({
  pillar: z.string().max(120),
  format: z.string().max(60),
  objective: z.string().max(300),
  visual_idea: z.string().max(500),
  hook: z.string().max(300),
  copy: z.string().max(1500),
  cta: z.string().max(200),
  metric: z.string().max(200),
});
export const itemsSchema = z.array(itemSchema).min(1).max(24);

const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 6000;

/** Llama a la API de Anthropic y devuelve los contenidos validados. Lanza Error con mensaje legible. */
export async function generateContentItems(briefText: string) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Falta ANTHROPIC_API_KEY");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system:
        "Responde SOLO con un arreglo JSON válido, sin texto adicional ni bloques de código. " +
        "Cada elemento tiene las claves: pillar, format, objective, visual_idea, hook, copy, cta, metric (todas texto).",
      messages: [{ role: "user", content: fullPrompt(briefText) }],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`La API de IA respondió ${res.status}`);

  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < 0) throw new Error("La IA no devolvió un JSON válido");
  return itemsSchema.parse(JSON.parse(text.slice(start, end + 1)));
}
