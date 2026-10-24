/** Mapa de automatizaciones estilo editor de nodos (como en el video). Ilustra el estado real de los flujos A–F. */
const FLOWS = [
  { id: "A", title: "Lead entrante", sub: "Formulario web", state: "Activa" },
  { id: "B", title: "Reserva", sub: "Calendly / manual", state: "Activa" },
  { id: "C", title: "Onboarding", sub: "Prospecto ganado", state: "Activa" },
  { id: "D", title: "Producción", sub: "Brief completo", state: "Activa" },
  { id: "E", title: "Seguimiento", sub: "Cron diario", state: "Activa" },
  { id: "F", title: "Reporte", sub: "Fin de mes", state: "Activa" },
];
const OUTPUTS = ["Fila en CRM", "Aviso por correo", "Tarea / checklist"];

export function AutomationGraph() {
  const W = 820;
  const rowH = 64;
  const top = 24;
  const H = top * 2 + rowH * 5 + 50;
  const hub = { x: W / 2, y: H / 2 };
  const left = FLOWS.map((_, i) => ({ x: 200, y: top + 25 + i * rowH }));
  const right = OUTPUTS.map((_, i) => ({ x: W - 200, y: H / 2 + (i - 1) * 90 }));

  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2;
    return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  };

  return (
    <div className="overflow-x-auto rounded-2xl border bg-[color-mix(in_oklch,var(--background)_70%,black)] p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[640px] w-full" role="img" aria-label="Mapa de flujos de automatización A a F">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeOpacity="0.06" />
          </pattern>
          <linearGradient id="wire" x1="0" x2="1">
            <stop offset="0" stopColor="#7c6cf0" />
            <stop offset="1" stopColor="#5fd4e8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" className="text-foreground" />

        {left.map((p, i) => (
          <path key={`l${i}`} d={curve({ x: p.x + 70, y: p.y }, { x: hub.x - 70, y: hub.y })} fill="none" stroke="url(#wire)" strokeWidth="2" opacity="0.8" filter="url(#glow)" className="wire-flow" />
        ))}
        {right.map((p, i) => (
          <path key={`r${i}`} d={curve({ x: hub.x + 70, y: hub.y }, { x: p.x - 70, y: p.y })} fill="none" stroke="#5fd4e8" strokeWidth="2" opacity="0.8" filter="url(#glow)" className="wire-flow" />
        ))}

        {FLOWS.map((f, i) => (
          <g key={f.id} transform={`translate(${left[i].x - 70},${left[i].y - 22})`}>
            <rect width="140" height="44" rx="8" fill="#1b1d2b" stroke="#7c6cf0" strokeOpacity="0.5" />
            <rect width="140" height="14" rx="8" fill="#3a3a6b" />
            <text x="8" y="10" fontSize="8" fill="#cfd0ff" fontWeight="600">
              {f.id} · {f.state.toUpperCase()}
            </text>
            <text x="8" y="28" fontSize="10.5" fill="#fff" fontWeight="600">{f.title}</text>
            <text x="8" y="39" fontSize="8" fill="#9a9cc0">{f.sub}</text>
            <circle cx="140" cy="29" r="4" fill="#f0b45f" />
          </g>
        ))}

        <g transform={`translate(${hub.x - 70},${hub.y - 34})`}>
          <rect width="140" height="68" rx="10" fill="#1b1d2b" stroke="#7c6cf0" strokeWidth="1.5" />
          <rect width="140" height="16" rx="10" fill="#5b4bd5" />
          <text x="10" y="12" fontSize="9" fill="#fff" fontWeight="700">AUMENTA · CRM</text>
          <text x="10" y="36" fontSize="11" fill="#fff" fontWeight="600">automation_runs</text>
          <text x="10" y="50" fontSize="8.5" fill="#9a9cc0">Cada ejecución queda registrada</text>
          <circle cx="0" cy="40" r="4" fill="#5fd4e8" />
          <circle cx="140" cy="40" r="4" fill="#5fd4e8" />
        </g>

        {OUTPUTS.map((o, i) => (
          <g key={o} transform={`translate(${right[i].x - 70},${right[i].y - 20})`}>
            <rect width="140" height="40" rx="8" fill="#1b1d2b" stroke="#5fd4e8" strokeOpacity="0.5" />
            <rect width="140" height="12" rx="8" fill="#2c5e72" />
            <text x="8" y="9" fontSize="7.5" fill="#d3f6ff" fontWeight="600">SALIDA</text>
            <text x="8" y="29" fontSize="10.5" fill="#fff" fontWeight="600">{o}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
