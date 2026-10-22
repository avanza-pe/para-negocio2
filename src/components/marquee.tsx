/** Cinta horizontal infinita (CSS puro). El contenido se duplica para el bucle. */
export function Marquee({ items }: { items: readonly string[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((it, i) => (
        <li key={`${it}-${i}`} className="whitespace-nowrap text-sm font-medium text-muted-foreground">
          {it}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
