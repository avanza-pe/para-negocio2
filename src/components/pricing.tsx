"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PACKAGES } from "@/lib/site";

const GROUPS = [
  { id: "mensual", label: "Mensual", match: (u: string) => u === "al mes" },
  { id: "proyecto", label: "Por proyecto", match: (u: string) => u !== "al mes" },
] as const;

export function Pricing() {
  const [group, setGroup] = React.useState<(typeof GROUPS)[number]["id"]>("mensual");
  const current = GROUPS.find((g) => g.id === group)!;
  const plans = PACKAGES.filter((p) => current.match(p.unit));

  return (
    <div>
      <div role="tablist" aria-label="Tipo de plan" className="mx-auto flex w-fit rounded-full border bg-card/60 p-1 backdrop-blur">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={group === g.id}
            onClick={() => setGroup(g.id)}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm transition-colors",
              group === g.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className={cn("mx-auto mt-10 grid gap-5", plans.length === 2 ? "max-w-3xl md:grid-cols-2" : "md:grid-cols-3")}>
        {plans.map((p) => {
          const featured = "featured" in p && p.featured;
          return (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col gap-5 rounded-3xl border bg-card/70 p-6 backdrop-blur transition-transform hover:-translate-y-1",
                featured && "border-transparent bg-gradient-to-b from-primary/15 to-card/70 ring-2 ring-primary shadow-2xl shadow-primary/20",
              )}
            >
              {featured && <Badge className="absolute -top-3 left-6">Más elegido</Badge>}
              <div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-semibold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.unit}</span>
                </p>
              </div>
              <ul className="grid gap-2.5 text-sm">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
              <Button
                variant={featured ? "default" : "outline"}
                className="mt-auto h-10 w-full rounded-full"
                nativeButton={false}
                render={<Link href="/#contacto" />}
              >
                Quiero este plan
              </Button>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Precios de lanzamiento orientativos, a validar. La inversión publicitaria en Meta/TikTok se cobra aparte.
      </p>
    </div>
  );
}
