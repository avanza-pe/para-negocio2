import "server-only";
import QRCode from "qrcode";

/** QR en SVG (librería open source `qrcode`, MIT). Corrección "M": sigue leyéndose con un poco de suciedad o dobleces. */
export function qrSvg(text: string, color = "#111111") {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: color, light: "#ffffff" } });
}
