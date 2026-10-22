"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, Copy, FileText, Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeleteButton, Field, FormDialog, SelectField, SubmitButton, TextField, type Option } from "@/components/form-bits";
import {
  createCategory,
  createVenue,
  deleteCategory,
  deleteMenuItem,
  importMenuText,
  moveCategory,
  recordVenueMetrics,
  renameCategory,
  rotateOwnerToken,
  saveMenuItem,
  toggleMenuItem,
  updateVenue,
} from "@/lib/actions/venues";
import type { ActionState } from "@/lib/actions/types";
import { MENU_TAGS, VENUE_KINDS, type MenuCategory, type MenuItem, type Venue } from "@/lib/crm";
import { parseMenuText, slugify, soles } from "@/lib/menu";
import { cn } from "@/lib/utils";

/** Toast + cierre al guardar con éxito (para formularios fuera de FormDialog). */
function useSaved(state: ActionState, message: string, onOk?: () => void) {
  const handled = React.useRef(state);
  React.useEffect(() => {
    if (state !== handled.current && state.ok) {
      handled.current = state;
      toast.success(message);
      onOk?.();
    }
  }, [state, message, onOk]);
}

export function NewVenueDialog({ clients }: { clients: Option[] }) {
  const [slug, setSlug] = React.useState("");
  return (
    <FormDialog title="Nuevo local" description="Restaurante, cafetería o similar. Después cargas la carta y lo publicas." trigger="Nuevo local" action={createVenue} successMessage="Local creado">
      {(s) => (
        <>
          <TextField label="Nombre del local" name="name" required onChange={(e) => setSlug(slugify(e.target.value))} state={s} />
          <TextField label="Enlace de la carta" name="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder="cafe-aurora" state={s} />
          <p className="-mt-2 text-xs text-muted-foreground">Quedará en /m/{slug || "nombre-del-local"}</p>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Tipo" name="kind" options={VENUE_KINDS} defaultValue="restaurante" state={s} />
            <TextField label="WhatsApp de pedidos" name="whatsapp" type="tel" placeholder="987 654 321" state={s} />
          </div>
          <SelectField label="Cliente (opcional)" name="client_id" options={clients} state={s} />
        </>
      )}
    </FormDialog>
  );
}

/** Datos del local: contacto, horarios, Yape, avisos y publicación. */
export function VenueForm({ venue, clients }: { venue: Venue; clients: Option[] }) {
  const [state, action, pending] = React.useActionState(updateVenue, {});
  useSaved(state, "Datos guardados");
  const err = (k: string) => state.fieldErrors?.[k];
  const t = (name: keyof Venue, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <TextField label={label} name={name} defaultValue={(venue[name] as string | null) ?? ""} state={state} {...props} />
  );
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="id" value={venue.id} />
      <section className="grid gap-3 sm:grid-cols-2">
        {t("name", "Nombre", { required: true })}
        {t("slug", "Enlace (/m/…)", { required: true })}
        <SelectField label="Tipo" name="kind" options={VENUE_KINDS} defaultValue={venue.kind} state={state} />
        <SelectField label="Cliente" name="client_id" options={clients} defaultValue={venue.client_id ?? undefined} state={state} />
        <div className="sm:col-span-2">{t("tagline", "Frase corta", { placeholder: "Café de especialidad y desayunos peruanos" })}</div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">Contacto y ubicación</h3>
        {t("whatsapp", "WhatsApp de pedidos", { type: "tel" })}
        {t("hours_text", "Horario", { placeholder: "Lun–Sáb 8:00–22:00 · Dom 9:00–18:00" })}
        {t("address", "Dirección")}
        {t("district", "Distrito")}
        {t("city", "Ciudad")}
        {t("maps_url", "Enlace de Google Maps", { type: "url", placeholder: "https://maps.app.goo.gl/…" })}
        {t("instagram", "Instagram", { placeholder: "@micafe" })}
        {t("tiktok", "TikTok", { placeholder: "@micafe" })}
        <div className="sm:col-span-2">{t("google_review_url", "Enlace para dejar reseña en Google", { type: "url", placeholder: "https://g.page/r/…/review" })}</div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">Pedidos y pagos</h3>
        {t("yape_number", "Número de Yape", { type: "tel" })}
        {t("yape_name", "Titular del Yape")}
        <div className="sm:col-span-2">{t("delivery_note", "Nota de delivery", { placeholder: "Delivery en Miraflores y San Isidro · S/ 5" })}</div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="accepts_orders" defaultChecked={venue.accepts_orders} /> Recibir pedidos por WhatsApp
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="accepts_reservations" defaultChecked={venue.accepts_reservations} /> Recibir reservas
        </label>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">Avisos de reservas al local</h3>
        {t("notify_email", "Correo del local", { type: "email" })}
        {t("telegram_chat_id", "Chat de Telegram (id)", { inputMode: "numeric", placeholder: "123456789" })}
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Telegram es gratis e instantáneo: el dueño escribe a tu bot y copias su chat id (ver docs/apis-gratis.md).
        </p>
      </section>

      <section className="grid items-end gap-3 sm:grid-cols-2">
        <Field label="Color de la marca" name="accent_color" error={err("accent_color")}>
          <Input id="accent_color" name="accent_color" type="color" defaultValue={venue.accent_color} className="h-10 w-24 p-1" />
        </Field>
        <label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-medium">
          <Checkbox name="published" defaultChecked={venue.published} /> Carta publicada (visible en internet)
        </label>
      </section>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton pending={pending} className="w-fit">
        Guardar datos
      </SubmitButton>
    </form>
  );
}

// ───────── Carta ─────────
export function NewCategoryForm({ venueId }: { venueId: string }) {
  const [state, action, pending] = React.useActionState(createCategory.bind(null, venueId), {});
  const ref = React.useRef<HTMLFormElement>(null);
  useSaved(state, "Categoría creada", () => ref.current?.reset());
  return (
    <form ref={ref} action={action} className="flex items-start gap-2">
      <div className="grid gap-1">
        <Input name="name" placeholder="Nueva categoría (Cafés, Postres…)" aria-label="Nueva categoría" className="w-64" aria-invalid={!!state.fieldErrors?.name} />
        {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>}
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />} Categoría
      </Button>
    </form>
  );
}

export function CategoryControls({ category, venueId, first, last }: { category: MenuCategory; venueId: string; first: boolean; last: boolean }) {
  const [pending, start] = React.useTransition();
  return (
    <div className="flex items-center gap-0.5">
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Renombrar categoría"
        title="Renombrar"
        disabled={pending}
        onClick={() => {
          const name = window.prompt("Nuevo nombre de la categoría", category.name)?.trim();
          if (name && name !== category.name) start(() => renameCategory(category.id, venueId, name));
        }}
      >
        <Pencil />
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Subir categoría" disabled={pending || first} onClick={() => start(() => moveCategory(category.id, venueId, -1))}>
        <ArrowUp />
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Bajar categoría" disabled={pending || last} onClick={() => start(() => moveCategory(category.id, venueId, 1))}>
        <ArrowDown />
      </Button>
      <DeleteButton action={deleteCategory.bind(null, category.id, venueId)} label={`Eliminar ${category.name}`} confirm={`¿Eliminar «${category.name}» y todos sus platos?`} />
    </div>
  );
}

/** Crear o editar un plato (con foto opcional a Supabase Storage). */
export function MenuItemDialog({ venueId, categories, item, defaultCategory }: { venueId: string; categories: Option[]; item?: MenuItem; defaultCategory?: string }) {
  return (
    <FormDialog
      title={item ? `Editar ${item.name}` : "Nuevo plato"}
      trigger={item ? `Editar ${item.name}` : "Plato"}
      icon={item ? <Pencil /> : undefined}
      compact={!item}
      action={saveMenuItem}
      successMessage={item ? "Plato actualizado" : "Plato agregado"}
    >
      {(s) => (
        <>
          <input type="hidden" name="venue_id" value={venueId} />
          {item && <input type="hidden" name="id" value={item.id} />}
          <SelectField label="Categoría" name="category_id" options={categories} defaultValue={item?.category_id ?? defaultCategory} state={s} />
          <div className="grid grid-cols-[1fr_8rem] gap-3">
            <TextField label="Nombre" name="name" required defaultValue={item?.name} state={s} />
            <TextField label="Precio (S/)" name="price_pen" type="number" min="0" step="0.10" required defaultValue={item ? String(item.price_pen) : ""} state={s} />
          </div>
          <Field label="Descripción" name="description" error={s.fieldErrors?.description}>
            <Textarea id="description" name="description" rows={2} maxLength={300} defaultValue={item?.description ?? ""} />
          </Field>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Etiquetas</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {MENU_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-1.5 text-sm">
                  <Checkbox name="tags" value={tag} defaultChecked={item?.tags.includes(tag)} /> {tag}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Foto (JPG/PNG/WebP, máx. 2 MB)" name="photo" error={s.fieldErrors?.photo}>
              <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
            </Field>
            <TextField label="…o enlace de la foto" name="image_url" type="url" placeholder="https://…" defaultValue={item?.image_url ?? ""} state={s} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="available" defaultChecked={item?.available ?? true} /> Disponible (desmarca para «Agotado»)
          </label>
        </>
      )}
    </FormDialog>
  );
}

export function AvailabilityToggle({ item, onToggle }: { item: Pick<MenuItem, "id" | "available" | "name">; onToggle: (available: boolean) => Promise<void> }) {
  const [pending, start] = React.useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={item.available}
      aria-label={`${item.name}: ${item.available ? "disponible" : "agotado"}`}
      onClick={() => start(() => onToggle(!item.available))}
      className={cn(
        "inline-flex min-w-24 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        item.available ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      {pending ? <Loader2 className="size-3 animate-spin" /> : null}
      {item.available ? "Disponible" : "Agotado"}
    </button>
  );
}

export function MenuItemRow({ item, venueId, categories }: { item: MenuItem; venueId: string; categories: Option[] }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 text-sm">
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" className="size-12 rounded-lg object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {item.name} <span className="tabular-nums text-muted-foreground">· {soles(Number(item.price_pen))}</span>
        </p>
        {item.description && <p className="truncate text-xs text-muted-foreground">{item.description}</p>}
        {item.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <AvailabilityToggle item={item} onToggle={(a) => toggleMenuItem(item.id, venueId, a)} />
      <MenuItemDialog venueId={venueId} categories={categories} item={item} />
      <DeleteButton action={deleteMenuItem.bind(null, item.id, venueId)} label={`Eliminar ${item.name}`} confirm={`¿Eliminar «${item.name}»?`} />
    </li>
  );
}

const EXAMPLE = `CAFÉS
Espresso ........ S/ 7
Capuccino - con leche de avena - 11.50
DESAYUNOS
Pan con chicharrón 18
Con camote frito y sarza criolla`;

/** Pegar la carta como texto (de un PDF, foto transcrita o WhatsApp) con vista previa antes de importar. */
export function ImportMenuDialog({ venueId }: { venueId: string }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [state, action, pending] = React.useActionState(importMenuText.bind(null, venueId), {});
  useSaved(state, "Carta importada. Revisa precios y descripciones.", () => {
    setOpen(false);
    setText("");
  });
  const preview = React.useMemo(() => parseMenuText(text), [text]);
  const count = preview.categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <FileText /> Importar desde texto
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar carta</DialogTitle>
          <DialogDescription>Pega la carta: una línea por plato con su precio al final. Las líneas sin precio son categorías. Se agrega a lo que ya existe.</DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-3 md:grid-cols-2">
          <Textarea name="text" rows={14} value={text} onChange={(e) => setText(e.target.value)} placeholder={EXAMPLE} className="font-mono text-xs" aria-label="Carta en texto" />
          <div className="max-h-80 overflow-y-auto rounded-xl border p-3 text-sm">
            <p className="mb-2 text-xs text-muted-foreground">Vista previa: {count} platos en {preview.categories.length} categorías</p>
            {preview.categories.map((c) => (
              <div key={c.name} className="mb-3">
                <p className="font-semibold">{c.name}</p>
                <ul className="grid gap-0.5">
                  {c.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">
                        {it.name}
                        {it.description && <span className="text-muted-foreground"> · {it.description}</span>}
                      </span>
                      <span className="tabular-nums">{soles(it.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {preview.skipped.length > 0 && <p className="text-xs text-destructive">No entendí {preview.skipped.length} líneas: corrígelas o agrégalas a mano.</p>}
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive md:col-span-2">
              {state.error}
            </p>
          )}
          <SubmitButton pending={pending} className="w-fit">
            Importar {count} platos
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ───────── Enlaces ─────────
export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const origin = React.useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const full = value.startsWith("/") ? `${origin}${value}` : value;
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        <Input readOnly value={full} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} aria-label={label} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Copiar ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(full);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              toast.error("No se pudo copiar");
            }
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </div>
  );
}

export function RotateTokenButton({ venueId }: { venueId: string }) {
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (window.confirm("El enlace actual del dueño dejará de funcionar. ¿Generar uno nuevo?")) start(() => rotateOwnerToken(venueId));
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />} Nuevo enlace del dueño
    </Button>
  );
}

export function RecordMetricsForm({ venueId, defaultMonth }: { venueId: string; defaultMonth: string }) {
  const [pending, start] = React.useTransition();
  const [month, setMonth] = React.useState(defaultMonth);
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field label="Mes" name="metrics-month">
        <Input id="metrics-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
      </Field>
      <Button
        variant="outline"
        disabled={pending || !month}
        onClick={() =>
          start(async () => {
            const res = await recordVenueMetrics(venueId, month);
            if (res.ok) toast.success("Métricas registradas en el cliente");
            else toast.error(res.error ?? "No se pudo registrar");
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <Check />} Registrar en Métricas
      </Button>
    </div>
  );
}
