"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Loader2, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvailabilityToggle } from "@/components/venue-ui";
import { ownerSetPrice, ownerSetReservation, ownerToggleItem } from "@/lib/actions/owner";
import type { MenuItem, Reservation } from "@/lib/crm";
import { reservationConfirmMessage, soles } from "@/lib/menu";
import { formatPhone, waLink } from "@/lib/phone";

export function OwnerReservationActions({ token, reservation: r, venueName }: { token: string; reservation: Reservation; venueName: string }) {
  const [pending, start] = React.useTransition();
  const set = (status: string, msg: string) =>
    start(async () => {
      await ownerSetReservation(token, r.id, status);
      toast.success(msg);
    });
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {r.status === "pendiente" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => set("confirmada", "Reserva confirmada")}>
            {pending ? <Loader2 className="animate-spin" /> : <Check />} Confirmar
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => set("cancelada", "Reserva cancelada")}>
            <X /> No hay sitio
          </Button>
        </>
      )}
      {r.status === "confirmada" && (
        <>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => set("asistio", "Marcada como asistió")}>
            Asistió
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => set("no_asistio", "Marcada como no asistió")}>
            No vino
          </Button>
        </>
      )}
      <Button size="sm" variant="ghost" nativeButton={false} render={<a href={waLink(r.phone, reservationConfirmMessage(venueName, r))} target="_blank" rel="noopener noreferrer" />}>
        <MessageCircle /> {formatPhone(r.phone)}
      </Button>
    </div>
  );
}

export function OwnerItemRow({ token, item }: { token: string; item: MenuItem }) {
  const [editing, setEditing] = React.useState(false);
  const [pending, start] = React.useTransition();
  return (
    <li className="flex items-center justify-between gap-2 border-b py-2.5 text-sm last:border-0">
      <span className="min-w-0 flex-1">
        <span className={item.available ? undefined : "text-muted-foreground line-through"}>{item.name}</span>
      </span>
      {editing ? (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const price = Number(new FormData(e.currentTarget).get("price"));
            if (!Number.isFinite(price) || price < 0) return toast.error("Precio no válido");
            start(async () => {
              await ownerSetPrice(token, item.id, Math.round(price * 100) / 100);
              setEditing(false);
              toast.success("Precio actualizado");
            });
          }}
        >
          <Input name="price" type="number" step="0.10" min="0" defaultValue={item.price_pen} className="h-8 w-24" autoFocus aria-label={`Precio de ${item.name}`} />
          <Button size="icon-sm" type="submit" disabled={pending} aria-label="Guardar precio">
            {pending ? <Loader2 className="animate-spin" /> : <Check />}
          </Button>
        </form>
      ) : (
        <button type="button" className="tabular-nums underline decoration-dotted underline-offset-4" onClick={() => setEditing(true)} aria-label={`Cambiar precio de ${item.name}`}>
          {soles(item.price_pen)}
        </button>
      )}
      <AvailabilityToggle item={item} onToggle={(a) => ownerToggleItem(token, item.id, a)} />
    </li>
  );
}
