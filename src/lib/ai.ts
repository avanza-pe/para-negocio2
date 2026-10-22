import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ClientBrief, Persona } from "@/lib/crm";

// ───────── Proveedor ─────────
// Gratis: Gemini (Google AI Studio) y Groq tienen planes gratuitos con límites por minuto/día.
// De pago: Claude (Anthropic). Se usa el primero configurado, o el que diga AI_PROVIDER.
// Ojo: en los planes gratis el proveedor puede usar lo que envías para mejorar sus modelos:
// nunca mandes contraseñas, datos sensibles ni datos personales de clientes finales.
type Provider = "gemini" | "groq" | "openrouter" | "anthropic";

const KEYS: Record<Provider, string | undefined> = {
  gemini: process.env.GEMINI_API_KEY,
  groq: process.env.GROQ_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
};
const DEFAULT_MODEL: Record<Provider, string> = {
  gemini: "gemini-flash-latest", // alias que Google mantiene apuntando al Flash vigente
  groq: "llama-3.3-70b-versatile",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
  anthropic: "claude-sonnet-5-5",
};
const VISION_MODEL: Partial<Record<Provider, string>> = {
  groq: "meta-llama/llama-4-scout-17b-16e-instruct",
};
const OPENAI_COMPAT: Record<Exclude<Provider, "anthropic">, string> = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};
export const PROVIDER_LABEL: Record<Provider, string> = { gemini: "Google Gemini (gratis)", groq: "Groq (gratis)", openrouter: "OpenRouter (modelos :free)", anthropic: "Claude (Anthropic, de pago)" };

export function aiProvider() {
  const order: Provider[] = ["gemini", "groq", "openrouter", "anthropic"];
  const wanted = process.env.AI_PROVIDER as Provider | undefined;
  const provider = wanted && KEYS[wanted] ? wanted : order.find((p) => KEYS[p]);
  if (!provider) return null;
  return { provider, key: KEYS[provider]!, model: process.env.AI_MODEL || DEFAULT_MODEL[provider] };
}
export const aiConfigured = () => aiProvider() !== null;

type Image = { mime: string; base64: string };

/**
 * Pide al modelo un objeto JSON y lo valida con Zod. Lanza Error con mensaje legible.
 * `schema` es lo que se le pide al modelo (simple, sin límites de longitud); valida y recorta después.
 */
export async function generateObject<S extends z.ZodType>({
  system,
  prompt,
  schema,
  image,
  maxTokens = 16000,
}: {
  system: string;
  prompt: string;
  schema: S;
  image?: Image;
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const cfg = aiProvider();
  if (!cfg) throw new Error("La IA no está configurada");

  if (cfg.provider === "anthropic") {
    const client = new Anthropic({ apiKey: cfg.key, timeout: 120_000, maxRetries: 1 });
    try {
      const res = await client.beta.messages.parse({
        model: cfg.model,
        max_tokens: maxTokens,
        // Si un clasificador de seguridad rechaza la solicitud, se reintenta en otro modelo del lado del servidor.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium", format: zodOutputFormat(schema) },
        system,
        messages: [
          {
            role: "user",
            content: image
              ? [
                  { type: "image", source: { type: "base64", media_type: image.mime as "image/jpeg", data: image.base64 } },
                  { type: "text", text: prompt },
                ]
              : prompt,
          },
        ],
      });
      if (res.stop_reason === "refusal") throw new Error("La IA rechazó la solicitud");
      if (res.stop_reason === "max_tokens") throw new Error("La respuesta de la IA quedó incompleta");
      if (!res.parsed_output) throw new Error("La IA no devolvió un JSON válido");
      return res.parsed_output as z.infer<S>;
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) throw new Error("Límite de uso de la IA alcanzado. Intenta en unos minutos.");
      if (e instanceof Anthropic.AuthenticationError) throw new Error("La clave de Anthropic no es válida");
      if (e instanceof Anthropic.APIError) throw new Error(`La API de IA respondió ${e.status}`);
      throw e;
    }
  }

  // Gemini / Groq / OpenRouter: API compatible con OpenAI (chat completions + JSON mode).
  const model = image && VISION_MODEL[cfg.provider] && !process.env.AI_MODEL ? VISION_MODEL[cfg.provider]! : cfg.model;
  const res = await fetch(OPENAI_COMPAT[cfg.provider], {
    method: "POST",
    headers: { authorization: `Bearer ${cfg.key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: Math.min(maxTokens, 8000),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${system}\n\nResponde SOLO con un objeto JSON válido (sin texto extra ni bloques de código) que cumpla este JSON Schema:\n${JSON.stringify(z.toJSONSchema(schema))}` },
        {
          role: "user",
          content: image
            ? [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:${image.mime};base64,${image.base64}` } },
              ]
            : prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (res.status === 429) throw new Error("Límite gratuito de la IA alcanzado por ahora. Intenta en unos minutos.");
  if (!res.ok) throw new Error(`La API de IA respondió ${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("La IA no devolvió un JSON válido");
  const parsed = schema.safeParse(JSON.parse(text.slice(start, end + 1)));
  if (!parsed.success) throw new Error("La IA devolvió datos incompletos");
  return parsed.data;
}

// ───────── Producción de contenido (flujo D) ─────────
export const MASTER_PROMPT =
  "Actúa como estratega de marketing para una pyme en Perú. Usa únicamente la información confirmada del brief. " +
  "Si falta un dato, pregunta o márcalo como [POR CONFIRMAR]. Propón 12 contenidos distribuidos en 3 pilares; " +
  "para cada uno entrega objetivo, formato, idea visual, hook, copy, CTA y métrica. " +
  "Si hay buyer personas, reparte los contenidos entre ellas y escribe para cada una en su idioma. " +
  "Si el negocio es gastronómico, aprovecha fechas peruanas (Día del Pisco Sour, Día del Ceviche, Fiestas Patrias, Día de la Madre, etc.) solo si caen en el periodo. " +
  "No inventes precios, testimonios, resultados ni características del producto. " +
  "Señala riesgos de afirmaciones y derechos de imagen.";

const line = (k: string, v: string | null | undefined) => `- ${k}: ${v?.trim() || "[POR CONFIRMAR]"}`;

/** Brief en texto para el prompt. Excluye a propósito los accesos (access_notes): nunca van a un modelo. */
export function briefToText(clientName: string, service: string, b: ClientBrief | null, personas: Persona[] = []) {
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
    ...(personas.length
      ? [
          "",
          "BUYER PERSONAS",
          ...personas.map(
            (p) =>
              `- ${p.name}: ${[p.profile, p.goals && `busca ${p.goals}`, p.pains && `le frena ${p.pains}`, p.channels && `está en ${p.channels}`, p.message && `mensaje: ${p.message}`]
                .filter(Boolean)
                .join("; ")}`,
          ),
        ]
      : []),
  ].join("\n");
}

export function fullPrompt(briefText: string) {
  return `${MASTER_PROMPT}\n\nBRIEF\n${briefText}`;
}

const contentItem = z.object({
  pillar: z.string(),
  format: z.string(),
  objective: z.string(),
  visual_idea: z.string(),
  hook: z.string(),
  copy: z.string(),
  cta: z.string(),
  metric: z.string(),
});
const cut = (n: number) => (s: string) => s.slice(0, n);

export async function generateContentItems(briefText: string) {
  const out = await generateObject({
    system: "Eres estratega de contenido para pymes peruanas. Escribe en español de Perú, claro y sin exageraciones.",
    prompt: fullPrompt(briefText),
    schema: z.object({ items: z.array(contentItem) }),
  });
  const items = out.items.slice(0, 24).map((it) => ({
    pillar: cut(120)(it.pillar),
    format: cut(60)(it.format),
    objective: cut(300)(it.objective),
    visual_idea: cut(500)(it.visual_idea),
    hook: cut(300)(it.hook),
    copy: cut(1500)(it.copy),
    cta: cut(200)(it.cta),
    metric: cut(200)(it.metric),
  }));
  if (!items.length) throw new Error("La IA no propuso contenidos");
  return items;
}

// ───────── Buyer personas ─────────
const personaSchema = z.object({
  name: z.string(),
  profile: z.string(),
  goals: z.string(),
  pains: z.string(),
  channels: z.string(),
  objections: z.string(),
  message: z.string(),
});

export async function suggestPersonas(briefText: string) {
  const out = await generateObject({
    system:
      "Eres investigador de mercado en Perú. Propón buyer personas realistas a partir del brief, sin inventar datos del negocio. " +
      "Usa nombres descriptivos (no nombres propios de personas), por ejemplo «Oficinista del menú del día».",
    prompt: `Propón 3 buyer personas distintas para este negocio. Para cada una: name, profile (edad aprox., ocupación, zona, presupuesto), goals, pains, channels (dónde se informa y compra), objections y message (el ángulo que le funciona).\n\nBRIEF\n${briefText}`,
    schema: z.object({ personas: z.array(personaSchema) }),
    maxTokens: 6000,
  });
  return out.personas.slice(0, 5).map((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, cut(k === "name" ? 80 : 500)(v)])) as z.infer<typeof personaSchema>);
}

// ───────── Carta desde texto desordenado o foto ─────────
const menuSchema = z.object({
  categories: z.array(z.object({ name: z.string(), items: z.array(z.object({ name: z.string(), price: z.number(), description: z.string().nullable() })) })),
});

export async function structureMenu({ text, image }: { text?: string; image?: Image }) {
  const out = await generateObject({
    system:
      "Transcribes cartas de restaurantes peruanos. Devuelve SOLO lo que está escrito: no inventes platos, precios ni descripciones. " +
      "Precios en soles como número (18, 12.5). Si un plato no tiene precio legible, omítelo. Agrupa por las categorías de la carta.",
    prompt: `Convierte esta carta en categorías con sus platos.${text ? `\n\nCARTA:\n${text.slice(0, 15_000)}` : ""}`,
    schema: menuSchema,
    image,
  });
  return out.categories
    .map((c) => ({
      name: cut(60)(c.name.trim() || "Carta"),
      items: c.items
        .filter((i) => i.name.trim() && Number.isFinite(i.price) && i.price >= 0 && i.price < 100_000)
        .map((i) => ({ name: cut(120)(i.name.trim()), price: Math.round(i.price * 100) / 100, description: i.description ? cut(300)(i.description.trim()) : null })),
    }))
    .filter((c) => c.items.length);
}
