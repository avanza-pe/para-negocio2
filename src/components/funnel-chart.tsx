"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = { total: { label: "Prospectos", color: "var(--chart-1)" } } satisfies ChartConfig;

export function FunnelChart({ data }: { data: { stage: string; total: number }[] }) {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid horizontal={false} />
        <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} width={120} />
        <XAxis type="number" allowDecimals={false} hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
