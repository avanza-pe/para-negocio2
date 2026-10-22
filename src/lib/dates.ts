/**
 * Fechas en hora de Lima. El servidor (Vercel) corre en UTC: `new Date().toISOString().slice(0, 10)`
 * da "mañana" desde las 19:00 de Lima. Perú es UTC-5 todo el año (sin horario de verano).
 */
export const LIMA_TZ = "America/Lima";
const OFFSET = "-05:00";

const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: LIMA_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Fecha de hoy en Lima, YYYY-MM-DD. */
export const limaDate = (d: Date = new Date()) => ymd.format(d);

/** "YYYY-MM-DDTHH:mm" (input datetime-local, hora de Lima) → ISO UTC. null si no es válida. */
export function limaLocalToISO(local: string) {
  const d = new Date(`${local.length === 16 ? `${local}:00` : local}${OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Fin del día (Lima) de una fecha YYYY-MM-DD, en ISO UTC. */
export const limaEndOfDayISO = (date: string = limaDate()) => new Date(`${date}T23:59:59.999${OFFSET}`).toISOString();

/** Inicio del día (Lima) de una fecha YYYY-MM-DD, en ISO UTC. */
export const limaStartOfDayISO = (date: string = limaDate()) => new Date(`${date}T00:00:00${OFFSET}`).toISOString();

/** Suma días a una fecha YYYY-MM-DD. */
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Suma meses a YYYY-MM-DD sin desbordar (31-ene + 1 mes = 28/29-feb, no 3-mar). */
export function addMonths(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

/** "YYYY-MM" o "YYYY-MM-DD" → primer día del mes "YYYY-MM-01". null si no es válido. */
export function monthStart(value: string) {
  const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(value.trim());
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  return `${m[1]}-${m[2]}-01`;
}

/** Nombre del mes en español: "2026-10-01" → "octubre 2026". */
export const monthLabel = (date: string) =>
  new Date(`${date.slice(0, 7)}-15T12:00:00Z`).toLocaleDateString("es-PE", { month: "long", year: "numeric", timeZone: "UTC" });
