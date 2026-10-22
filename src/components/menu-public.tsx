"use client";

import * as React from "react";
import Link from "next/link";
import { AtSign, CalendarCheck, CircleCheck, Clock, MapPin, MessageCircle, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, TextField } from "@/components/form-bits";
import { submitReservation } from "@/lib/actions/public-venue";
import type { ActionState } from "@/lib/actions/types";
import { label, VENUE_KINDS, type MenuItem } from "@/lib/crm";
import { buildOrderMessage, cartTotal, readableText, soles, type CartLine, type OrderDetails } from "@/lib/menu";
import { formatPhone } from "@/lib/phone";
import type { PublicMenu } from "@/lib/venues";
import { cn } from "@/lib/utils";

const track = (slug: string, kind: string) => {
  try {
    navigator.sendBeacon?.(`/api/m/${slug}/event`, kind);
  } catch {
    // sin métricas no pasa nada
  }
};

const read = (k: string) => {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    // modo privado
  }
};

export function PublicMenuView({ menu, poweredBy }: { menu: PublicMenu; poweredBy: string }) {
  const { venue, categories, demo } = menu;
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [open, setOpen] = React.useState(false);
  const canOrder = venue.accepts_orders && Boolean(venue.whatsapp);
  const accent = venue.accent_color;
  const onAccent = readableText(accent);

  React.useEffect(() => track(venue.slug, "view"), [venue.slug]);

  const items = React.useMemo(() => new Map(categories.flatMap((c) => c.items).map((i) => [i.id, i])), [categories]);
  const lines: CartLine[] = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ id, qty, name: items.get(id)?.name ?? "", price: items.get(id)?.price_pen ?? 0 }));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = cartTotal(lines);

  const add = (id: string, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, Math.min(50, (c[id] ?? 0) + d)) }));
  const wa = (text: string) => `https://wa.me/${venue.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <div className="min-h-dvh bg-background pb-28" style={{ "--venue": accent, "--on-venue": onAccent } as React.CSSProperties}>
      {demo && (
        <div className="bg-amber-400 px-4 py-2 text-center text-xs font-medium text-amber-950">
          Carta de demostración · los pedidos llegan al WhatsApp de {poweredBy} para que veas cómo funciona.{" "}
          <Link href="/restaurantes" className="underline">
            Quiero la mía
          </Link>
        </div>
      )}

      <header className="relative overflow-hidden px-4 pb-6 pt-10 text-center" style={{ background: `linear-gradient(160deg, ${accent}, color-mix(in oklch, ${accent} 55%, black))`, color: onAccent }}>
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">
          {label(VENUE_KINDS, venue.kind)}
          {venue.district ? ` · ${venue.district}` : ""}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">{venue.name}</h1>
        {venue.tagline && <p className="mx-auto mt-2 max-w-md text-sm opacity-90">{venue.tagline}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {venue.whatsapp && (
            <a href={wa(`Hola ${venue.name}, tengo una consulta`)} onClick={() => track(venue.slug, "call")} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur hover:bg-white/25">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          {venue.maps_url && (
            <a href={venue.maps_url} target="_blank" rel="noopener noreferrer" onClick={() => track(venue.slug, "maps")} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur hover:bg-white/25">
              <MapPin className="size-4" /> Cómo llegar
            </a>
          )}
          {venue.instagram && (
            <a href={venue.instagram.startsWith("http") ? venue.instagram : `https://instagram.com/${venue.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" onClick={() => track(venue.slug, "instagram")} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur hover:bg-white/25">
              <AtSign className="size-4" /> Instagram
            </a>
          )}
          {venue.accepts_reservations && (
            <a href="#reservas" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur hover:bg-white/25">
              <CalendarCheck className="size-4" /> Reservar
            </a>
          )}
        </div>
      </header>

      {categories.length > 1 && (
        <nav aria-label="Categorías" className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b bg-background/90 px-4 py-2.5 backdrop-blur">
          {categories.map((c) => (
            <a key={c.id} href={`#cat-${c.id}`} className="shrink-0 rounded-full border px-3 py-1 text-sm hover:bg-accent">
              {c.name}
            </a>
          ))}
        </nav>
      )}

      <main className="mx-auto grid max-w-2xl gap-8 px-4 pt-6">
        {categories.length === 0 && <p className="py-10 text-center text-muted-foreground">La carta se está actualizando. Escríbenos por WhatsApp.</p>}
        {categories.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-16">
            <h2 className="mb-3 font-heading text-xl font-semibold">{c.name}</h2>
            <ul className="grid gap-2.5">
              {c.items.map((it) => (
                <MenuRow key={it.id} item={it} qty={cart[it.id] ?? 0} canOrder={canOrder} onAdd={(d) => add(it.id, d)} />
              ))}
            </ul>
          </section>
        ))}

        <InfoSection venue={venue} onReview={() => track(venue.slug, "review_click")} />

        {venue.accepts_reservations && <ReservationSection slug={venue.slug} venueName={venue.name} />}

        <footer className="pb-6 pt-2 text-center text-xs text-muted-foreground">
          Precios en soles, incluyen IGV. Carta digital hecha con{" "}
          <Link href="/restaurantes" className="underline underline-offset-2">
            {poweredBy}
          </Link>
          .
        </footer>
      </main>

      {canOrder && count > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left font-medium shadow-2xl"
            style={{ background: "var(--venue)", color: "var(--on-venue)" }}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="size-5" /> Ver pedido · {count}
            </span>
            <span className="tabular-nums">{soles(total)}</span>
          </button>
        </div>
      )}

      {canOrder && (
        <OrderSheet
          open={open}
          onOpenChange={setOpen}
          venue={venue}
          colors={{ "--venue": accent, "--on-venue": onAccent } as React.CSSProperties}
          lines={lines}
          total={total}
          onChange={add}
          onSend={(msg) => {
            track(venue.slug, "whatsapp_order");
            window.location.href = wa(msg);
          }}
        />
      )}
    </div>
  );
}

function MenuRow({ item, qty, canOrder, onAdd }: { item: MenuItem; qty: number; canOrder: boolean; onAdd: (d: number) => void }) {
  return (
    <li className={cn("flex gap-3 rounded-2xl border bg-card p-3", !item.available && "opacity-60")}>
      {item.image_url && (
        // Fotos externas sin optimizar: evita consumir la cuota gratuita de optimización de imágenes.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" loading="lazy" className="size-20 shrink-0 rounded-xl object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{item.name}</p>
          <p className="shrink-0 font-medium tabular-nums">{soles(item.price_pen)}</p>
        </div>
        {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {!item.available && <Badge variant="destructive">Agotado</Badge>}
            {item.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
          {canOrder && item.available && (
            <div className="flex items-center gap-1.5">
              {qty > 0 && (
                <>
                  <Button size="icon-sm" variant="outline" className="rounded-full" aria-label={`Quitar ${item.name}`} onClick={() => onAdd(-1)}>
                    <Minus />
                  </Button>
                  <span className="w-5 text-center text-sm tabular-nums" aria-live="polite">
                    {qty}
                  </span>
                </>
              )}
              <Button size="icon-sm" className="rounded-full" style={{ background: "var(--venue)", color: "var(--on-venue)" }} aria-label={`Agregar ${item.name}`} onClick={() => onAdd(1)}>
                <Plus />
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function OrderSheet({
  open,
  onOpenChange,
  venue,
  colors,
  lines,
  total,
  onChange,
  onSend,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  venue: PublicMenu["venue"];
  /** La hoja se pinta en un portal fuera del contenedor de la carta: hay que repetir las variables de color. */
  colors: React.CSSProperties;
  lines: CartLine[];
  total: number;
  onChange: (id: string, d: number) => void;
  onSend: (message: string) => void;
}) {
  const [mode, setMode] = React.useState<OrderDetails["mode"]>("recojo");
  const [payment, setPayment] = React.useState<OrderDetails["payment"]>(venue.yape_number ? "yape" : "efectivo");
  // El contenido del pedido solo se pinta al abrir la hoja (en el navegador): leer localStorage aquí no desincroniza el SSR.
  const [name, setName] = React.useState(() => read("carta:nombre"));

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const details: OrderDetails = {
      name: String(f.get("name") ?? "").trim(),
      mode,
      address: String(f.get("address") ?? "").trim(),
      table: String(f.get("table") ?? "").trim(),
      payment,
      notes: String(f.get("notes") ?? "").trim(),
    };
    if (details.name.length < 2) return toast.error("Escribe tu nombre");
    if (mode === "delivery" && (details.address ?? "").length < 5) return toast.error("Escribe la dirección de entrega");
    if (lines.length === 0) return toast.error("Tu pedido está vacío");
    write("carta:nombre", details.name);
    onSend(buildOrderMessage(venue.name, lines, details));
  }

  const choice = (active: boolean) => cn("rounded-full border px-3 py-1.5 text-sm transition-colors", active ? "border-transparent font-medium" : "hover:bg-accent");
  const activeStyle = { background: "var(--venue)", color: "var(--on-venue)" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-3xl" style={colors}>
        <SheetHeader>
          <SheetTitle>Tu pedido</SheetTitle>
          <SheetDescription>Se envía por WhatsApp a {venue.name}. El local te confirma el tiempo y el pago.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="mx-auto grid w-full max-w-2xl gap-4 px-4 pb-6">
          <ul className="grid gap-2">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{l.name}</span>
                <span className="flex items-center gap-1.5">
                  <Button type="button" size="icon-xs" variant="outline" aria-label={`Quitar ${l.name}`} onClick={() => onChange(l.id, -1)}>
                    <Minus />
                  </Button>
                  <span className="w-5 text-center tabular-nums">{l.qty}</span>
                  <Button type="button" size="icon-xs" variant="outline" aria-label={`Agregar ${l.name}`} onClick={() => onChange(l.id, 1)}>
                    <Plus />
                  </Button>
                </span>
                <span className="w-20 text-right tabular-nums">{soles(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t pt-3 font-medium">
            Total <span className="tabular-nums">{soles(total)}</span>
          </p>

          <div className="grid gap-1.5">
            <Label htmlFor="order-name">Tu nombre</Label>
            <Input id="order-name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">¿Cómo lo quieres?</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["recojo", "Para recoger"],
                  ["delivery", "Delivery"],
                  ["mesa", "Estoy en el local"],
                ] as const
              ).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={mode === v} className={choice(mode === v)} style={mode === v ? activeStyle : undefined} onClick={() => setMode(v)}>
                  {l}
                </button>
              ))}
            </div>
            {mode === "delivery" && <Input name="address" placeholder="Dirección y referencia" autoComplete="street-address" />}
            {mode === "delivery" && venue.delivery_note && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="size-3.5" /> {venue.delivery_note}
              </p>
            )}
            {mode === "mesa" && <Input name="table" placeholder="Número de mesa" inputMode="numeric" />}
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Pago</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["yape", "Yape"],
                  ["plin", "Plin"],
                  ["efectivo", "Efectivo"],
                  ["tarjeta", "Tarjeta"],
                ] as const
              ).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={payment === v} className={choice(payment === v)} style={payment === v ? activeStyle : undefined} onClick={() => setPayment(v)}>
                  {l}
                </button>
              ))}
            </div>
            {payment === "yape" && venue.yape_number && (
              <p className="rounded-xl bg-muted p-3 text-sm">
                Yapea <b>{soles(total)}</b> al <b className="tabular-nums">{formatPhone(venue.yape_number)}</b>
                {venue.yape_name && <> ({venue.yape_name})</>} y envía la captura en el chat.
              </p>
            )}
          </fieldset>

          <Textarea name="notes" rows={2} placeholder="Notas: sin cebolla, con cubiertos, etc." maxLength={300} />
          <Button type="submit" className="h-12 rounded-full text-base" style={activeStyle}>
            <MessageCircle /> Enviar pedido por WhatsApp
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function InfoSection({ venue, onReview }: { venue: PublicMenu["venue"]; onReview: () => void }) {
  const rows = [
    venue.hours_text && { icon: Clock, text: venue.hours_text },
    (venue.address || venue.district) && { icon: MapPin, text: [venue.address, venue.district, venue.city].filter(Boolean).join(", ") },
    venue.delivery_note && { icon: Truck, text: venue.delivery_note },
  ].filter(Boolean) as { icon: typeof Clock; text: string }[];
  if (!rows.length && !venue.google_review_url && !venue.yape_number) return null;
  return (
    <section className="grid gap-3 rounded-3xl border bg-card p-5 text-sm">
      <h2 className="font-heading text-lg font-semibold">Información</h2>
      {rows.map(({ icon: Icon, text }) => (
        <p key={text} className="flex items-start gap-2">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {text}
        </p>
      ))}
      {venue.yape_number && (
        <p className="flex items-start gap-2">
          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded bg-[#742284] text-[9px] font-bold text-white">Y</span>
          Aceptamos Yape: {formatPhone(venue.yape_number)}
          {venue.yape_name ? ` (${venue.yape_name})` : ""}
        </p>
      )}
      {venue.google_review_url && (
        <a
          href={venue.google_review_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onReview}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 font-medium hover:bg-accent"
        >
          <Star className="size-4 fill-amber-400 text-amber-400" /> ¿Te gustó? Déjanos tu reseña en Google
        </a>
      )}
    </section>
  );
}

function ReservationSection({ slug, venueName }: { slug: string; venueName: string }) {
  const [state, action, pending] = React.useActionState<ActionState, FormData>(submitReservation.bind(null, slug), {});
  const minDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());

  if (state.ok) {
    return (
      <section id="reservas" className="grid justify-items-center gap-2 rounded-3xl border bg-card p-6 text-center">
        <CircleCheck className="size-10 text-emerald-500" />
        <h2 className="font-heading text-lg font-semibold">¡Reserva enviada!</h2>
        <p className="text-sm text-muted-foreground">{venueName} la revisará y te confirmará por WhatsApp.</p>
      </section>
    );
  }

  return (
    <section id="reservas" className="scroll-mt-16 rounded-3xl border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold">Reserva tu mesa</h2>
      <p className="mb-4 text-sm text-muted-foreground">Te confirmamos por WhatsApp.</p>
      <form action={action} className="grid gap-3" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Nombre" name="name" autoComplete="name" required state={state} />
          <TextField label="Celular" name="phone" type="tel" autoComplete="tel" placeholder="987 654 321" required state={state} />
          <TextField label="Fecha" name="date" type="date" min={minDate} required state={state} />
          <TextField label="Hora" name="time" type="time" required state={state} />
          <TextField label="Personas" name="party_size" type="number" min="1" max="50" defaultValue="2" required state={state} />
        </div>
        <Field label="Comentarios (opcional)" name="notes">
          <Textarea id="notes" name="notes" rows={2} maxLength={300} placeholder="Cumpleaños, silla para bebé, terraza…" />
        </Field>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            No llenar
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <Checkbox name="consent" className="mt-0.5" />
          <span>Acepto que {venueName} use mis datos solo para gestionar esta reserva.</span>
        </label>
        {state.fieldErrors?.consent && (
          <p role="alert" className="text-xs text-destructive">
            {state.fieldErrors.consent[0]}
          </p>
        )}
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <SubmitButton pending={pending} className="h-11 rounded-full">
          <CalendarCheck /> Enviar reserva
        </SubmitButton>
      </form>
    </section>
  );
}
