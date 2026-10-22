import type { Metadata } from "next";

export const metadata: Metadata = { title: "Condiciones del servicio" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-16 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
      <h1 className="text-3xl font-semibold tracking-tight">Condiciones básicas del servicio</h1>
      <p className="rounded-lg border bg-muted/50 p-3 text-sm">
        Borrador operativo. Valídalo con un profesional antes de firmarlo con clientes.
      </p>
      <h2>Alcance</h2>
      <p>Cada propuesta detalla número de entregables, duración, rondas de revisión, materiales que aporta el cliente, tiempos de respuesta, reportes y exclusiones.</p>
      <h2>Aprobación humana</h2>
      <p>Usamos IA para acelerar la producción. Una persona revisa cada entrega y nada se publica sin autorización del cliente.</p>
      <h2>Inversión publicitaria</h2>
      <p>El presupuesto de Meta, TikTok u otras plataformas se paga por separado y directamente por el cliente.</p>
      <h2>Resultados</h2>
      <p>No garantizamos ventas. Reportamos solo métricas verificables.</p>
      <h2>Pago</h2>
      <ul>
        <li>Transferencia bancaria, Yape o Plin, según lo acordado.</li>
        <li>El trabajo inicia al confirmarse el primer pago.</li>
      </ul>
    </article>
  );
}
