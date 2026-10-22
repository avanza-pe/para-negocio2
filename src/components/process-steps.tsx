"use client";

import * as React from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Línea de tiempo del proceso: la barra se llena con el scroll y cada paso se enciende en orden. */
export function ProcessSteps({ steps }: { steps: readonly string[] }) {
  const ref = React.useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-step]", root);

      gsap.fromTo(
        "[data-line]",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: root, start: "top 75%", end: "bottom 60%", scrub: 0.4 } },
      );
      items.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0.35, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div className="relative mt-12">
      <div aria-hidden className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-border md:block">
        <div data-line className="h-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500" />
      </div>
      <ol ref={ref} className="grid gap-4 md:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step} data-step className="relative pt-0 md:pt-10">
            <span className="absolute left-0 top-0 hidden size-[2.3rem] place-items-center rounded-full border bg-background font-heading text-sm font-semibold md:grid">
              {i + 1}
            </span>
            <div className="h-full rounded-2xl border bg-card/80 p-5">
              <span className="font-heading text-3xl font-semibold text-gradient md:hidden">0{i + 1}</span>
              <p className="mt-2 font-medium md:mt-0">{step}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
