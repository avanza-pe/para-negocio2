import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <article className="prose-sm mx-auto max-w-2xl space-y-4 px-4 py-16 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
      <h1 className="text-3xl font-semibold tracking-tight">Política de privacidad</h1>
      <p className="rounded-lg border bg-muted/50 p-3 text-sm">
        Borrador operativo. Revísalo con un profesional antes de escalar el tratamiento de datos (Ley N.º 29733 de Protección de Datos Personales, Perú).
      </p>
      <h2>Qué datos recogemos</h2>
      <p>Nombre, correo, teléfono (opcional), nombre del negocio, rubro y el mensaje que escribas en el formulario.</p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Responder tu consulta y enviarte una propuesta.</li>
        <li>Coordinar una reunión si la solicitas.</li>
        <li>Llevar un registro interno de nuestra relación comercial.</li>
      </ul>
      <p>No vendemos tus datos ni te enviamos mensajes masivos no solicitados.</p>
      <h2>Con quién los compartimos</h2>
      <p>Con proveedores que alojan el servicio (hosting y base de datos) y envían avisos internos. No los compartimos con terceros para publicidad.</p>
      <h2>Cuánto tiempo los conservamos</h2>
      <p>Mientras exista una relación comercial o hasta que solicites su eliminación.</p>
      <h2>Tus derechos</h2>
      <p>Puedes pedir acceso, rectificación, cancelación u oposición escribiendo a {SITE.contactEmail}. Respetamos toda solicitud de no contacto.</p>
    </article>
  );
}
