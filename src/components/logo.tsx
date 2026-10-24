import { cn } from "@/lib/utils";

/** Isotipo AUMENTA: "A" redondeada (usa el color del texto) + triángulo en degradado cian → azul → magenta. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="100 250 1040 740" role="img" aria-label="AUMENTA" className={cn("h-6 w-auto", className)}>
      <defs>
        <linearGradient id="avz-tri" x1="0.25" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#2563eb" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <path
        fill="currentColor"
        d="M125 980 L515 322 Q540 272 590 272 L665 272 Q715 272 742 322 L1115 980 L940 980 Q905 980 885 940 L635 495 Q625 480 615 495 L360 940 Q340 980 308 980 Z"
      />
      <path
        fill="url(#avz-tri)"
        d="M447 955 L615 662 Q625 650 635 662 L800 955 Q800 965 785 965 L460 965 Q445 965 447 955 Z"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-heading text-lg font-semibold tracking-[0.18em]">AUMENTA</span>
    </span>
  );
}
