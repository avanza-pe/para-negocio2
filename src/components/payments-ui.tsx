"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, MessageCircle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, SelectField, TextField, type Option } from "@/components/form-bits";
import { createMonthlyPayment, createPayment, markPaymentPaid } from "@/lib/actions/payments";
import { MANUAL_PAY_METHODS } from "@/lib/crm";
import { waLink } from "@/lib/phone";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function NewPaymentDialog({ clients, defaultClient }: { clients: Option[]; defaultClient?: string }) {
  return (
    <FormDialog
      title="Nuevo cobro"
      description="Genera un enlace de pago: el cliente paga con Yape o tarjeta (Mercado Pago) o por Yape/Plin directo."
      trigger="Nuevo cobro"
      action={createPayment}
      successMessage="Cobro creado. Copia el enlace o envíalo por WhatsApp."
    >
      {(s) => (
        <>
          <SelectField label="Cliente (opcional)" name="client_id" options={clients} defaultValue={defaultClient} state={s} />
          <TextField label="Concepto" name="concept" required placeholder="Carta digital · implementación" state={s} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Monto (S/)" name="amount_pen" type="number" min="1" step="0.01" required state={s} />
            <TextField label="Vence" name="due_date" type="date" state={s} />
            <TextField label="Mes del servicio (opcional)" name="period" type="month" state={s} />
            <TextField label="Correo del pagador" name="payer_email" type="email" state={s} />
          </div>
          <TextField label="Nota interna" name="notes" state={s} />
        </>
      )}
    </FormDialog>
  );
}

/** Botón "Cobro del mes" en la ficha del cliente. */
export function MonthlyPaymentButton({ clientId }: { clientId: string }) {
  const [pending, start] = React.useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await createMonthlyPayment(clientId);
          if (res.ok) toast.success("Cobro del mes creado. Envíalo desde Cobros.");
          else toast.error(res.error ?? "No se pudo crear");
        })
      }
    >
      <Receipt /> Cobro del mes
    </Button>
  );
}

/** Copiar enlace de pago y compartir por WhatsApp. */
export function PayLinkActions({
  token,
  concept,
  amount,
  client,
  phone,
}: {
  token: string;
  concept: string;
  amount: number;
  client?: string | null;
  phone?: string | null;
}) {
  const [copied, setCopied] = React.useState(false);
  const url = () => `${window.location.origin}/pagar/${token}`;
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Copiar enlace de pago"
        title="Copiar enlace de pago"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.error("No se pudo copiar");
          }
        }}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Enviar por WhatsApp"
        title="Enviar por WhatsApp"
        onClick={() => {
          const text = `Hola${client ? ` ${client}` : ""}, te comparto el enlace para pagar ${concept} (${pen.format(amount)}): ${url()}\nPuedes pagar con Yape o tarjeta. ¡Gracias!`;
          window.open(waLink(phone, text), "_blank", "noopener,noreferrer");
        }}
      >
        <MessageCircle />
      </Button>
    </div>
  );
}

/** Registrar pago manual con su método (revisa la constancia antes de marcarlo). */
export function MarkPaidSelect({ id }: { id: string }) {
  const [pending, start] = React.useTransition();
  return (
    <Select
      items={MANUAL_PAY_METHODS as unknown as Option[]}
      value={null}
      disabled={pending}
      onValueChange={(v) => {
        if (typeof v === "string" && window.confirm("¿Confirmas que revisaste la constancia y el pago llegó?")) {
          start(async () => {
            await markPaymentPaid(id, v);
            toast.success("Pago registrado");
          });
        }
      }}
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue placeholder="Marcar pagado…" />
      </SelectTrigger>
      <SelectContent>
        {MANUAL_PAY_METHODS.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
