import { ImageResponse } from "next/og";

export const alt = "AVANZA · Marketing digital con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 0%, #4b3bb3 0%, #0d0d17 55%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="92" height="66" viewBox="100 250 1040 740">
            <defs>
              <linearGradient id="g" x1="0.25" y1="0" x2="0.85" y2="1">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="0.5" stopColor="#2563eb" />
                <stop offset="1" stopColor="#c026d3" />
              </linearGradient>
            </defs>
            <path fill="#fff" d="M125 980 L515 322 Q540 272 590 272 L665 272 Q715 272 742 322 L1115 980 L940 980 Q905 980 885 940 L635 495 Q625 480 615 495 L360 940 Q340 980 308 980 Z" />
            <path fill="url(#g)" d="M447 955 L615 662 Q625 650 635 662 L800 955 Q800 965 785 965 L460 965 Q445 965 447 955 Z" />
          </svg>
          <div style={{ fontSize: 44, letterSpacing: 10, fontWeight: 700 }}>AVANZA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            Haz que tu negocio avance con contenido y automatización con IA
          </div>
          <div style={{ fontSize: 30, color: "#b9b6e8" }}>Marketing digital con IA · Perú</div>
        </div>
      </div>
    ),
    size,
  );
}
