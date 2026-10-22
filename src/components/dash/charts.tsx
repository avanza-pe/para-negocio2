/* Gráficos SVG sin dependencias, en el estilo del video (violeta sobre carbón). Componentes de servidor: no necesitan JS en el cliente. */

const VIOLET = "#7c6cf0";
const CYAN = "#5fd4e8";

function smooth(points: number[][]) {
  return points.reduce((d, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = a[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
}

/** Barras violeta + línea blanca superpuesta ("Services plans" del video). */
export function ComboChart({ labels, bars, line, barLabel, lineLabel }: {
  labels: string[];
  bars: number[];
  line: number[];
  barLabel: string;
  lineLabel: string;
}) {
  const W = 600;
  const H = 220;
  const pad = { l: 28, r: 8, t: 10, b: 24 };
  const max = Math.max(...bars, ...line, 1);
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const step = iw / labels.length;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const pts = line.map((v, i) => [pad.l + step * i + step / 2, y(v)]);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${barLabel} y ${lineLabel}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((k) => (
          <g key={k}>
            <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih * (1 - k)} y2={pad.t + ih * (1 - k)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={0} y={pad.t + ih * (1 - k) + 3} fontSize="9" fill="currentColor" opacity="0.5">
              {Math.round(max * k)}
            </text>
          </g>
        ))}
        {bars.map((v, i) => {
          const h = Math.max(((v / max) * ih), v > 0 ? 3 : 0);
          return <rect key={i} x={pad.l + step * i + step * 0.22} y={pad.t + ih - h} width={step * 0.56} height={h} rx="4" fill={VIOLET} opacity="0.9" />;
        })}
        <path d={smooth(pts)} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        {pts.map(([x, py], i) => (
          <circle key={i} cx={x} cy={py} r="3" fill="#fff" />
        ))}
        {labels.map((l, i) => (
          <text key={l + i} x={pad.l + step * i + step / 2} y={H - 6} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.55">
            {l}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm" style={{ background: VIOLET }} />{barLabel}</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-white" />{lineLabel}</span>
      </div>
    </div>
  );
}

/** Área con degradado violeta → cian ("Marketing analytics" del video). */
export function AreaChart({ labels, values, valueLabel }: { labels: string[]; values: number[]; valueLabel: string }) {
  const W = 420;
  const H = 160;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * (W - 20) + 10, H - 24 - (v / max) * (H - 44)]);
  const d = smooth(pts);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={valueLabel}>
      <defs>
        <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={VIOLET} stopOpacity="0.5" />
          <stop offset="1" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="area-line" x1="0" x2="1">
          <stop offset="0" stopColor={VIOLET} />
          <stop offset="1" stopColor={CYAN} />
        </linearGradient>
      </defs>
      {[0.33, 0.66, 1].map((k) => (
        <line key={k} x1="0" x2={W} y1={H - 24 - k * (H - 44)} y2={H - 24 - k * (H - 44)} stroke="currentColor" strokeOpacity="0.07" />
      ))}
      <path d={`${d} L${pts[pts.length - 1][0]},${H - 24} L${pts[0][0]},${H - 24} Z`} fill="url(#area-fill)" />
      <path d={d} fill="none" stroke="url(#area-line)" strokeWidth="2.5" strokeLinecap="round" />
      {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#fff" stroke={VIOLET} strokeWidth="2" />}
      {labels.map((l, i) => (
        <text key={l + i} x={(i / Math.max(labels.length - 1, 1)) * (W - 20) + 10} y={H - 6} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.55">
          {l}
        </text>
      ))}
    </svg>
  );
}

/** Medidor semicircular ("23%" del video). */
export function Gauge({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 52;
  const c = Math.PI * r;
  return (
    <div className="relative mx-auto w-44">
      <svg viewBox="0 0 120 70" className="w-full" role="img" aria-label={`${label}: ${v}%`}>
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0" stopColor={VIOLET} />
            <stop offset="1" stopColor={CYAN} />
          </linearGradient>
        </defs>
        <path d="M8 62 A52 52 0 0 1 112 62" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="10" strokeLinecap="round" />
        <path d="M8 62 A52 52 0 0 1 112 62" fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-heading text-3xl font-semibold leading-none">{v}%</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/** Barras horizontales con degradado ("Marketing analytics" lateral del video). */
export function HBars({ items }: { items: { name: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const colors = [VIOLET, CYAN, "#a78bfa", "#38bdf8", "#c084fc"];
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Sin datos todavía.</p>;
  return (
    <ul className="grid gap-3">
      {items.map((it, i) => (
        <li key={it.name}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="truncate text-muted-foreground">{it.name}</span>
            <span className="font-medium tabular-nums">{it.value}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${Math.max((it.value / max) * 100, 4)}%`, background: colors[i % colors.length] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Calendario del mes con días marcados (reuniones). */
export function MiniCalendar({ date, marked }: { date: Date; marked: number[] }) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7; // lunes = 0
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const today = date.getDate();
  return (
    <div>
      <p className="mb-3 text-sm font-medium capitalize">{date.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <span key={d} className="pb-1 text-muted-foreground">{d}</span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`e${i}`} />
          ) : (
            <span
              key={d}
              className={`grid aspect-square place-items-center rounded-full ${
                d === today ? "bg-primary font-semibold text-primary-foreground" : marked.includes(d) ? "bg-primary/20 font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              {d}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
