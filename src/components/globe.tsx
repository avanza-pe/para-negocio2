"use client";

import * as React from "react";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

const PERU: [number, number] = [-75, -10]; // lon, lat aprox.

/** Globo alámbrico (canvas) que gira y se detiene mirando a Perú. Respeta prefers-reduced-motion. */
export function Globe({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const topo = world as unknown as Topology;
    const land = feature(topo, topo.objects.countries as GeometryCollection);
    const graticule = geoGraticule10();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = 0;
    let raf = 0;
    let lon = reduce ? -PERU[0] : -PERU[0] + 120;

    const style = getComputedStyle(canvas);
    const colorOf = () => style.color || "#888";

    const resize = () => {
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const projection = geoOrthographic()
        .translate([(size * dpr) / 2, (size * dpr) / 2])
        .scale((size * dpr) / 2 - 4)
        .rotate([lon, 15, 0]);
      const path = geoPath(projection, ctx);
      const color = colorOf();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1 * dpr;

      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.stroke();

      ctx.beginPath();
      path(graticule);
      ctx.globalAlpha = 0.12;
      ctx.stroke();

      ctx.beginPath();
      path(land);
      ctx.globalAlpha = 0.7;
      ctx.stroke();

      // Marcador de Lima/Perú (solo si es visible)
      const p = projection(PERU);
      const visible = Math.cos(((lon + PERU[0]) * Math.PI) / 180) > 0.2;
      if (p && visible) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#22d3ee";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 11 * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const tick = () => {
      const target = -PERU[0];
      // gira y se asienta en Perú
      const diff = ((target - lon + 540) % 360) - 180;
      lon += Math.abs(diff) < 0.2 ? 0 : Math.sign(diff) * Math.min(Math.abs(diff) * 0.03 + 0.15, 1.2);
      draw();
      raf = requestAnimationFrame(tick);
    };

    if (reduce) draw();
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} style={{ aspectRatio: "1 / 1", width: "100%" }} />;
}
