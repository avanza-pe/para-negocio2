"use client";

import * as React from "react";
import { BarChart3, CalendarDays, Clapperboard, Image as ImageIcon, LayoutGrid, Megaphone, Play, Sparkles } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Tile = { label: string; icon: typeof Play; tone: string };

// Muestras ilustrativas de piezas (no son trabajos de clientes).
const TILES: Tile[] = [
  { label: "Reel", icon: Clapperboard, tone: "from-violet-600 via-indigo-600 to-fuchsia-500" },
  { label: "Calendario", icon: CalendarDays, tone: "from-cyan-500 to-blue-600" },
  { label: "Post", icon: ImageIcon, tone: "from-fuchsia-500 to-rose-500" },
  { label: "Métricas", icon: BarChart3, tone: "from-indigo-600 to-cyan-500" },
  { label: "Story", icon: Sparkles, tone: "from-amber-400 to-rose-500" },
  { label: "Anuncio", icon: Megaphone, tone: "from-blue-600 to-violet-600" },
  { label: "Carrusel", icon: LayoutGrid, tone: "from-emerald-400 to-cyan-600" },
  { label: "Video corto", icon: Play, tone: "from-purple-600 to-pink-500" },
];

const PER_RAIL = 7; // tarjetas por riel
const CYCLE = 14; // segundos para recorrer el riel

/** Dos rieles de tarjetas que salen del punto de fuga central y crecen hacia los bordes, en bucle. */
export function ImageStream() {
  const stage = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-stream]"));
    const reduce = prefersReducedMotion();
    let visible = true;
    let t = reduce ? 0.42 * CYCLE : 0;

    const render = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      const reach = w * 0.58;
      for (const el of cards) {
        const side = Number(el.dataset.side); // -1 izquierda, 1 derecha
        const lane = Number(el.dataset.lane); // 0..PER_RAIL-1
        const p = (((t / CYCLE + lane / PER_RAIL) % 1) + 1) % 1;
        const eased = p * p * (1.6 - 0.6 * p); // aceleración suave hacia los bordes
        const x = side * eased * reach;
        const y = (side === -1 ? -1 : 1) * Math.sin(lane * 1.7 + 1) * h * 0.05 * (0.4 + p) + (side === 1 ? 6 : -6) * p;
        const scale = (0.18 + eased * 1.05) * (w < 640 ? 0.7 : 1);
        const rot = -side * (14 + 38 * p);
        const fade = Math.min(p / 0.12, 1) * Math.min((1 - p) / 0.14, 1);
        gsap.set(el, { x, y, scale, rotateY: rot, opacity: fade, zIndex: Math.round(p * 100) });
      }
    };

    render();
    if (reduce) return;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    io.observe(root);
    const tick = (_: number, dt: number) => {
      if (!visible) return;
      t += dt / 1000;
      render();
    };
    gsap.ticker.add(tick);
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const rail = (side: -1 | 1) =>
    Array.from({ length: PER_RAIL }, (_, lane) => {
      const tile = TILES[(lane + (side === 1 ? 4 : 0)) % TILES.length];
      const Icon = tile.icon;
      return (
        <div
          key={`${side}-${lane}`}
          data-stream
          data-side={side}
          data-lane={lane}
          className={`absolute left-1/2 top-1/2 -ml-24 -mt-32 flex h-64 w-48 flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-br ${tile.tone} p-4 text-white shadow-2xl will-change-transform`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <Icon className="size-6 opacity-90" />
          <div>
            <p className="font-heading text-xl font-semibold leading-none">{tile.label}</p>
            <p className="mt-1 text-[11px] text-white/75">Muestra</p>
          </div>
        </div>
      );
    });

  return (
    <div
      ref={stage}
      aria-hidden
      className="relative mx-auto h-[26rem] w-full max-w-6xl overflow-hidden [perspective:1100px] [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] sm:h-[30rem]"
    >
      <div className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />
      {rail(-1)}
      {rail(1)}
    </div>
  );
}
