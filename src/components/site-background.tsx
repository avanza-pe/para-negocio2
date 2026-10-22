/** Fondo de página: base oscura/clara, resplandores cian-azul-magenta, cuadrícula con máscara y grano sutil. */
export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute -top-40 left-1/2 h-[42rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#7c5cf255,transparent)] blur-3xl dark:opacity-100 opacity-60" />
      <div className="absolute -top-20 -left-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,#22d3ee33,transparent)] blur-3xl" />
      <div className="absolute top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,#c026d330,transparent)] blur-3xl" />
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(transparent_55%,var(--background))]" />
    </div>
  );
}
