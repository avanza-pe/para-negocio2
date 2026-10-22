import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InlineSelect } from "@/components/form-bits";
import { setProspectStage } from "@/lib/actions/crm";
import { STAGES, type Prospect } from "@/lib/crm";

const COLUMN_TONE: Record<string, string> = {
  nuevo: "bg-sky-500",
  investigado: "bg-indigo-500",
  contactado: "bg-violet-500",
  respondio: "bg-fuchsia-500",
  reunion_agendada: "bg-amber-500",
  propuesta_enviada: "bg-orange-500",
  ganado: "bg-emerald-500",
  perdido: "bg-rose-500",
  seguimiento_futuro: "bg-slate-500",
};

/** Tablero por etapas. Mover una tarjeta = cambiar su etapa con el selector. */
export function ProspectBoard({ prospects }: { prospects: Prospect[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {STAGES.map((stage) => {
        const items = prospects.filter((p) => p.stage === stage.value);
        return (
          <section key={stage.value} className="w-72 shrink-0 rounded-xl bg-muted/50 p-2">
            <header className="flex items-center justify-between px-2 py-1.5">
              <h2 className="flex items-center gap-2 text-sm font-medium">
                <span className={`size-2 rounded-full ${COLUMN_TONE[stage.value]}`} />
                {stage.label}
              </h2>
              <Badge variant="secondary">{items.length}</Badge>
            </header>
            <ul className="grid gap-2">
              {items.length === 0 && (
                <li className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">Vacío</li>
              )}
              {items.map((p) => {
                const overdue = p.next_action_at && p.next_action_at <= today && !["ganado", "perdido"].includes(p.stage);
                return (
                  <li key={p.id} className="rounded-lg border bg-card p-3 shadow-xs">
                    <p className="font-medium">{p.company}</p>
                    <p className="text-xs text-muted-foreground">{[p.contact_name, p.sector].filter(Boolean).join(" · ")}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {p.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" /> {p.contact_email}
                        </span>
                      )}
                      {p.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" /> {p.contact_phone}
                        </span>
                      )}
                    </div>
                    {p.next_action && (
                      <p className={`mt-2 rounded-md px-2 py-1 text-xs ${overdue ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
                        {p.next_action}
                        {p.next_action_at && ` · ${p.next_action_at}`}
                      </p>
                    )}
                    <InlineSelect id={p.id} value={p.stage} options={STAGES} action={setProspectStage} className="mt-2 w-full" />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
