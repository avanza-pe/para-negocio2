import "server-only";

/**
 * Avisos instantáneos con un bot de Telegram (gratis, sin límites prácticos para este uso).
 * Crear el bot: hablar con @BotFather → /newbot → copiar el token a TELEGRAM_BOT_TOKEN.
 * chat_id: escribir al bot y abrir https://api.telegram.org/bot<TOKEN>/getUpdates (campo chat.id).
 * Devuelve false si no está configurado. Nunca lanza: un aviso fallido no debe romper el flujo.
 */
export async function sendTelegram(text: string, chatId = process.env.TELEGRAM_CHAT_ID) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const telegramConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
