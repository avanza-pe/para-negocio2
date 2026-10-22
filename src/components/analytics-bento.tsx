"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";

export type BentoData = {
  labels: string[];
  line: number[]; // serie principal
  lineLabel: string;
  waveA: number[];
  waveALabel: string;
  waveB: number[];
  waveBLabel: string;
  categories: { name: string; value: number }[];
  radar: { name: string; value: number }[]; // valores 0–100
};

const W = 320;
const H = 120;

function scale(values: number[], w = W, h = H, pad = 10) {
  const max = Math.max(...values, 1);
  return values.map((v, i) => [
    values.length === 1 ? w / 2 : (i / (values.length - 1)) * w,
    h - pad - (v / max) * (h - pad * 2),
  ]);
}

function smooth(points: number[][]) {
  return points.reduce((d, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = a[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
}

function useCountUp(target: number) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = reduce ? 1 : Math.min((t - t0) / 900, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

const COLORS = ["#22d3ee", "#7c6cf0", "#7c6cf0", "#c026d3", "#14b8a6", "#f59e0b"];

export function AnalyticsBento({ data, sample = false, format = (n: number) => n.toLocaleString("es-PE") }: {
  data: BentoData;
  sample?: boolean;
  format?: (n: number) => string;
}) {
  const [idx, setIdx] = React.useState(data.line.length - 1);
  const safeIdx = Math.min(idx, data.line.length - 1);
  const pts = scale(data.line);
  const path = smooth(pts);
  const total = data.line.reduce((a, b) => a + b, 0);
  const shown = useCountUp(data.line[safeIdx] ?? 0);
  const [cx, cy] = pts[safeIdx] ?? [0, 0];

  const a = smooth(scale(data.waveA, W, 70, 6));
  const b = smooth(scale(data.waveB, W, 70, 6));
  const catTotal = data.categories.reduce((s, c) => s + c.value, 0) || 1;

  const R = 52;
  const radarPts = data.radar.map((r, i) => {
    const ang = (Math.PI * 2 * i) / data.radar.length - Math.PI / 2;
    return [60 + Math.cos(ang) * R * (r.value / 100), 60 + Math.sin(ang) * R * (r.value / 100), ang] as const;
  });

  return (
    <div className="grid gap-4 md:grid-cols-6">
      {/* línea principal */}
      <Card className="md:col-span-4">
        <div className="px-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{data.lineLabel}</p>
              <p className="font-heading text-4xl font-semibold tabular-nums">{format(shown)}</p>
              <p className="text-xs text-muted-foreground">
                {data.labels[safeIdx]} · total del periodo {format(total)}
              </p>
            </div>
            {sample && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">Datos de muestra</span>}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label={data.lineLabel}>
            <defs>
              <linearGradient id="bento-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#7c6cf0" stopOpacity="0.35" />
                <stop offset="1" stopColor="#7c6cf0" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="bento-line" x1="0" x2="1">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#c026d3" />
              </linearGradient>
            </defs>
            <path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#bento-area)" />
            <path d={path} fill="none" stroke="url(#bento-line)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={cx} x2={cx} y1="0" y2={H} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 3" />
            <circle cx={cx} cy={cy} r="4.5" fill="#fff" stroke="#7c6cf0" strokeWidth="2" />
          </svg>
          <label className="sr-only" htmlFor="bento-range">
            Elegir periodo
          </label>
          <input
            id="bento-range"
            type="range"
            min={0}
            max={data.line.length - 1}
            value={safeIdx}
            onChange={(e) => setIdx(Number(e.target.value))}
            className="mt-1 w-full accent-[#7c6cf0]"
          />
        </div>
      </Card>

      {/* olas */}
      <Card className="md:col-span-2">
        <div className="px-5">
          <p className="text-sm text-muted-foreground">{data.waveALabel} vs {data.waveBLabel}</p>
          <svg viewBox={`0 0 ${W} 70`} className="mt-3 w-full" role="img" aria-label="Comparación">
            <path d={`${a} L${W},70 L0,70 Z`} fill="#22d3ee" fillOpacity="0.25" />
            <path d={a} fill="none" stroke="#22d3ee" strokeWidth="2" />
            <path d={`${b} L${W},70 L0,70 Z`} fill="#c026d3" fillOpacity="0.22" />
            <path d={b} fill="none" stroke="#c026d3" strokeWidth="2" />
          </svg>
          <div className="mt-2 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-cyan-400" />{data.waveALabel}</span>
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-fuchsia-600" />{data.waveBLabel}</span>
          </div>
        </div>
      </Card>

      {/* treemap */}
      <Card className="md:col-span-3">
        <div className="px-5">
          <p className="text-sm text-muted-foreground">Por categoría</p>
          <div className="mt-3 flex h-36 flex-wrap gap-1.5">
            {data.categories.map((c, i) => (
              <div
                key={c.name}
                className="flex min-w-14 flex-col justify-end rounded-lg p-2 text-xs font-medium text-white"
                style={{ background: COLORS[i % COLORS.length], flexGrow: Math.max(c.value, 1), flexBasis: `${Math.max((c.value / catTotal) * 100, 18)}%` }}
              >
                <span className="truncate">{c.name}</span>
                <span className="opacity-80">{format(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* radar */}
      <Card className="md:col-span-3">
        <div className="flex items-center gap-4 px-5">
          <div>
            <p className="text-sm text-muted-foreground">Equilibrio</p>
            <ul className="mt-2 grid gap-1 text-xs text-muted-foreground">
              {data.radar.map((r) => (
                <li key={r.name}>{r.name}: <span className="text-foreground">{r.value}</span></li>
              ))}
            </ul>
          </div>
          <svg viewBox="0 0 120 120" className="ml-auto size-36" role="img" aria-label="Radar">
            {[0.33, 0.66, 1].map((k) => (
              <polygon
                key={k}
                points={data.radar.map((_, i) => {
                  const ang = (Math.PI * 2 * i) / data.radar.length - Math.PI / 2;
                  return `${60 + Math.cos(ang) * R * k},${60 + Math.sin(ang) * R * k}`;
                }).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.15"
              />
            ))}
            <polygon points={radarPts.map(([x, y]) => `${x},${y}`).join(" ")} fill="#7c6cf0" fillOpacity="0.3" stroke="#7c6cf0" strokeWidth="2" />
          </svg>
        </div>
      </Card>
    </div>
  );
}
