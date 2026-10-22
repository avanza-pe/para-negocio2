"use client";

import * as React from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Entrada al hacer scroll (GSAP + ScrollTrigger). Rápida y sin parpadeo: el CSS `.js [data-reveal]` lo oculta antes de pintar. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}

/** Secuencia de entrada del hero: elementos [data-hero] en cascada + tarjetas [data-card] que se abren en abanico y flotan. */
export function HeroStage({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-hero]", root);
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
      if (prefersReducedMotion()) {
        gsap.set([...items, ...cards], { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(items, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 })
        .fromTo(
          cards,
          { autoAlpha: 0, y: 80, scale: 0.9 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.12, ease: "back.out(1.4)" },
          "-=0.5",
        )
        .add(() => {
          // Flotación suave y continua, con fases distintas por tarjeta
          cards.forEach((c, i) =>
            gsap.to(c, { y: i % 2 ? -8 : 8, duration: 2.4 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1 }),
          );
        });

      // Parallax leve del collage al hacer scroll
      gsap.to("[data-parallax]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
