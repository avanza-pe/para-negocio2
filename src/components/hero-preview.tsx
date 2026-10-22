import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

/** Maqueta ilustrativa del flujo (no son datos reales de clientes). */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="glow absolute -inset-10 -z-10 opacity-70 blur-2xl" />
      <div className="rounded-2xl border bg-card/90 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Calendario de contenido</p>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">Muestra</span>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <span key={d}>{d}</span>
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className={`grid aspect-square place-items-center rounded-md text-xs ${
                [1, 3, 5, 8, 10, 12].includes(i) ? "bg-primary/15 font-medium text-primary" : "bg-muted"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
        <ul className="mt-4 grid gap-2 text-sm">
          <li className="flex items-center gap-2 rounded-lg bg-muted/70 p-2.5">
            <Sparkles className="size-4 text-primary" /> Hook y copy generados con IA
          </li>
          <li className="flex items-center gap-2 rounded-lg bg-muted/70 p-2.5">
            <CheckCircle2 className="size-4 text-emerald-500" /> Revisado y aprobado por una persona
          </li>
          <li className="flex items-center gap-2 rounded-lg bg-muted/70 p-2.5">
            <TrendingUp className="size-4 text-sky-500" /> Métrica del objetivo, sin inventar datos
          </li>
        </ul>
      </div>
    </div>
  );
}
