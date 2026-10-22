import { BarChart3, CalendarDays, Clapperboard, Play } from "lucide-react";

/** Collage de 3 muestras ilustrativas (no son resultados de clientes). */
export function HeroCollage() {
  return (
    <div aria-hidden className="relative mx-auto mt-14 h-72 w-full max-w-3xl sm:h-80">
      {/* izquierda: calendario */}
      <div className="absolute left-0 top-8 w-[44%] -rotate-6 rounded-2xl border bg-card/90 p-3 shadow-2xl backdrop-blur sm:left-4 sm:p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium">
          <CalendarDays className="size-3.5 text-primary" /> Calendario de contenido
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <span
              key={i}
              className={`aspect-square rounded-[5px] ${[2, 4, 8, 11, 15, 18].includes(i) ? "bg-gradient-to-br from-cyan-400 to-blue-600" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">Muestra</p>
      </div>

      {/* centro: reel */}
      <div className="absolute left-1/2 top-0 z-10 w-[34%] -translate-x-1/2 rounded-2xl border bg-card p-2 shadow-2xl sm:w-[28%]">
        <div className="relative grid aspect-[9/14] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500">
          <span className="grid size-10 place-items-center rounded-full bg-white/90 text-blue-700">
            <Play className="size-4 fill-current" />
          </span>
          <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-medium text-white">
            <Clapperboard className="size-3" /> Reel · Muestra
          </span>
        </div>
      </div>

      {/* derecha: métricas */}
      <div className="absolute right-0 top-10 w-[44%] rotate-6 rounded-2xl border bg-card/90 p-3 shadow-2xl backdrop-blur sm:right-4 sm:p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium">
          <BarChart3 className="size-3.5 text-primary" /> Métricas del objetivo
        </p>
        <div className="mt-4 flex h-16 items-end gap-1.5">
          {[30, 45, 38, 62, 55, 80, 70].map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[4px] bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">Muestra</p>
      </div>
    </div>
  );
}
