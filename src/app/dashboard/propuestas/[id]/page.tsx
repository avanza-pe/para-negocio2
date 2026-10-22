import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { PrintButton } from "@/components/print-button";
import { requireStaff } from "@/lib/auth";
import type { Proposal } from "@/lib/crm";

export const metadata = { title: "Propuesta" };

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h2 className="font-heading text-base font-semibold">
        {n}. {title}
      </h2>
      <div className="text-sm leading-relaxed text-muted-foreground print:text-black">{children}</div>
    </section>
  );
}

const lines = (t: string) => (
  <ul className="grid list-disc gap-1 pl-5">
    {t.split("\n").filter(Boolean).map((l) => (
      <li key={l}>{l}</li>
    ))}
  </ul>
);

export default async function ProposalPage({ params }: PageProps<"/dashboard/propuestas/[id]">) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("proposals").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Proposal;

  const date = new Date(p.created_at).toLocaleDateString("es-PE", { dateStyle: "long" });

  return (
    <>
      <div data-print-hide className="mb-4 flex items-center justify-between">
        <Link href="/dashboard/propuestas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Propuestas
        </Link>
        <PrintButton />
      </div>

      <article data-print-sheet className="mx-auto grid max-w-3xl gap-6 rounded-2xl border bg-card p-6 sm:p-10">
        <header className="flex items-start justify-between gap-4 border-b pb-5">
          <Logo />
          <div className="text-right text-xs text-muted-foreground print:text-black">
            <p>{date}</p>
            <p>Vigencia: {p.validity_days} días</p>
          </div>
        </header>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground print:text-black">Propuesta para</p>
          <h1 className="font-heading text-3xl font-semibold">{p.client_name}</h1>
          <p className="mt-1 text-muted-foreground print:text-black">{p.package}</p>
        </div>

        <Section n={1} title="Qué incluye">{lines(p.includes)}</Section>
        <Section n={2} title="Inversión">
          <p className="font-heading text-2xl font-semibold text-foreground print:text-black">
            {pen.format(Number(p.price_pen))} <span className="text-sm font-normal text-muted-foreground print:text-black">{p.price_unit}</span>
          </p>
        </Section>
        <Section n={3} title="Rondas de cambios y plazos">
          <p>
            {p.revisions} ronda{p.revisions === 1 ? "" : "s"} de cambios incluida{p.revisions === 1 ? "" : "s"}.{" "}
            {p.timeline ? `Plazo de entrega: ${p.timeline}.` : "Plazo de entrega: a confirmar al iniciar."}
          </p>
        </Section>
        <Section n={4} title="No incluye">{p.exclusions}</Section>
        <Section n={5} title="Materiales que aporta el cliente">{p.client_materials ?? "A definir."}</Section>
        <Section n={6} title="Forma de pago">{p.payment_terms}</Section>
        <Section n={7} title="Aprobación">
          Nada se publica ni se entrega sin tu autorización escrita. No garantizamos ventas: medimos la métrica del objetivo acordado y reportamos solo datos verificables.
        </Section>
        {p.notes && <Section n={8} title="Notas">{p.notes}</Section>}

        <footer className="border-t pt-4 text-xs text-muted-foreground print:text-black">
          Precios de lanzamiento sujetos a validación. Esta propuesta es un documento comercial; revísala antes de firmarla.
        </footer>
      </article>
    </>
  );
}
