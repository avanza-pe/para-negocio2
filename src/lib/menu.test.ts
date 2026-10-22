import { describe, expect, it } from "vitest";
import { buildOrderMessage, cartTotal, isValidSlug, parseMenuText, readableText, slugify } from "@/lib/menu";

describe("slugify", () => {
  it("quita tildes, símbolos y espacios", () => {
    expect(slugify("Café Aurora & Co.")).toBe("cafe-aurora-y-co");
    expect(slugify("  La Picantería de Doña Ñusta  ")).toBe("la-picanteria-de-dona-nusta");
  });
  it("produce slugs válidos y respeta los reservados", () => {
    expect(isValidSlug(slugify("Pollería El Rey 2"))).toBe(true);
    expect(isValidSlug("demo")).toBe(false);
    expect(isValidSlug("-mal")).toBe(false);
  });
});

describe("parseMenuText", () => {
  it("lee categorías, precios con y sin S/ y descripciones", () => {
    const { categories, skipped } = parseMenuText(`
CAFÉS
Espresso ..... S/ 7
Latte - con leche de avena - 13.50
# Desayunos
Pan con chicharrón 18
Con sarza criolla y camote frito
Postres:
Pie de limón S/.13,00
`);
    expect(skipped).toEqual([]);
    expect(categories.map((c) => c.name)).toEqual(["Cafés", "Desayunos", "Postres"]);
    expect(categories[0].items).toEqual([
      { name: "Espresso", price: 7, description: null },
      { name: "Latte", price: 13.5, description: "con leche de avena" },
    ]);
    expect(categories[1].items[0]).toEqual({ name: "Pan con chicharrón", price: 18, description: "Con sarza criolla y camote frito" });
    expect(categories[2].items[0].price).toBe(13);
  });

  it("no confunde 'Promo 2x1' con un precio", () => {
    const { categories } = parseMenuText("PROMOS\nPromo 2x1\nAlitas x6 S/ 25");
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe("Promo 2x1");
    expect(categories[0].items[0]).toMatchObject({ name: "Alitas x6", price: 25 });
  });

  it("usa 'Carta' si no hay categoría", () => {
    expect(parseMenuText("Chicha morada 8").categories[0].name).toBe("Carta");
  });
});

describe("pedido por WhatsApp", () => {
  const lines = [
    { id: "1", name: "Capuccino", price: 11, qty: 2 },
    { id: "2", name: "Alfajor", price: 3.5, qty: 3 },
    { id: "3", name: "Sin pedir", price: 99, qty: 0 },
  ];
  it("suma sin errores de coma flotante", () => {
    expect(cartTotal(lines)).toBe(32.5);
    expect(cartTotal([{ id: "x", name: "a", price: 0.1, qty: 3 }])).toBe(0.3);
  });
  it("arma el mensaje con total, entrega y pago", () => {
    const msg = buildOrderMessage("Café Aurora", lines, { name: "Ana", mode: "delivery", address: "Av. Grau 123", payment: "yape" });
    expect(msg).toContain("2 × Capuccino");
    expect(msg).not.toContain("Sin pedir");
    expect(msg).toContain("Total: S/");
    expect(msg).toContain("32.50");
    expect(msg).toContain("Delivery — Av. Grau 123");
    expect(msg).toContain("Pago: Yape");
  });
});

describe("readableText", () => {
  it("elige texto oscuro sobre colores claros y blanco sobre oscuros", () => {
    expect(readableText("#ffd54f")).toBe("#111111");
    expect(readableText("#3b0764")).toBe("#ffffff");
    expect(readableText("no-es-color")).toBe("#ffffff");
  });
});
