"use client";

import * as React from "react";
import Lenis from "lenis";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

/** Scroll suave con Lenis sincronizado con el ticker de GSAP/ScrollTrigger. Solo en la web pública. */
export function SmoothScroll() {
  React.useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Enlaces ancla (#seccion y /#seccion): desplazamiento suave con compensación del navbar.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href) return;
      const hash = href.startsWith("#") ? href : href.startsWith("/#") ? href.slice(1) : null;
      if (!hash || hash.length < 2) return;
      if (href.startsWith("/#") && window.location.pathname !== "/") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation(); // evita que Next también salte a la ancla
      lenis.scrollTo(target as HTMLElement, { offset: -88, duration: 1.1 });
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick, true);

    // Si se llega con #hash en la URL
    if (window.location.hash) {
      const t = document.querySelector(window.location.hash);
      if (t) setTimeout(() => lenis.scrollTo(t as HTMLElement, { offset: -88, immediate: true }), 50);
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
