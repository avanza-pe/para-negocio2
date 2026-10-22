import { Skeleton } from "@/components/ui/skeleton";

/** Se muestra al instante al cambiar de sección mientras llegan los datos. */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-64 rounded-xl" />
    </div>
  );
}
