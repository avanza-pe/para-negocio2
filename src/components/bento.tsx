"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid auto-rows-[minmax(11rem,auto)] gap-4 md:grid-cols-6", className)}>{children}</div>;
}

/** Tarjeta bento con foco de luz que sigue al cursor (solo CSS vars, sin re-render). */
export function BentoCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onPointerMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card/70 p-6 backdrop-blur transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(320px circle at var(--mx,50%) var(--my,50%), color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)" }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}
