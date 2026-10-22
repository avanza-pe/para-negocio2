import { CalendarCheck, Mail, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "@/components/globe";
import { LeadForm } from "@/components/lead-form";
import { SITE, whatsappLink } from "@/lib/site";

/** Sección "Contáctanos": globo + vías de contacto + formulario conectado al CRM (flujo A). */
export function ContactGlobe({
  title = "Contáctanos",
  text = "Cuéntanos sobre tu negocio y te respondemos con una propuesta breve adaptada a tu marca.",
  form,
}: {
  title?: string;
  text?: string;
  form?: React.ComponentProps<typeof LeadForm>;
}) {
  const wa = whatsappLink();
  const items = [
    SITE.contactEmail && { icon: Mail, label: "Correo", value: SITE.contactEmail, href: `mailto:${SITE.contactEmail}` },
    wa && { icon: MessageCircle, label: "WhatsApp", value: "Escríbenos", href: wa },
    SITE.bookingUrl && { icon: CalendarCheck, label: "Agenda", value: "Reserva una llamada de 15 min", href: SITE.bookingUrl },
    { icon: MapPin, label: "Ubicación", value: "Lima, Perú · atendemos todo el país", href: undefined },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-md text-muted-foreground">{text}</p>
        <div className="relative mx-auto mt-8 max-w-xs text-foreground sm:max-w-sm lg:mx-0">
          <div aria-hidden className="absolute inset-6 -z-10 rounded-full bg-[radial-gradient(closest-side,#7c5cf244,transparent)] blur-2xl" />
          <Globe />
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="text-sm">
                <span className="block text-muted-foreground">{label}</span>
                {href ? (
                  <a href={href} className="font-medium underline-offset-2 hover:underline" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {value}
                  </a>
                ) : (
                  <span className="font-medium">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Card className="rounded-3xl bg-card/80 shadow-2xl backdrop-blur">
        <CardContent>
          <LeadForm {...form} />
        </CardContent>
      </Card>
    </div>
  );
}
