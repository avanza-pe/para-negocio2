/**
 * Teléfonos para WhatsApp (wa.me exige solo dígitos con código de país).
 * Celular peruano de 9 dígitos que empieza en 9 → se antepone 51.
 */
export function normalizePhone(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 9 && digits.startsWith("9")) return `51${digits}`;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** Enlace de WhatsApp con mensaje. Sin número abre el selector de contactos del propio usuario. */
export function waLink(phone: string | null | undefined, text: string) {
  const n = normalizePhone(phone);
  return `https://wa.me/${n ?? ""}?text=${encodeURIComponent(text)}`;
}

/** 51987654321 → "987 654 321" para mostrar. */
export function formatPhone(value: string | null | undefined) {
  const n = normalizePhone(value);
  if (!n) return value ?? "";
  const local = n.startsWith("51") && n.length === 11 ? n.slice(2) : n;
  return local.length === 9 ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : local;
}
