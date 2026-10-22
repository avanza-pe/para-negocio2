"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionState } from "@/lib/actions/types";

export type Option = { value: string; label: string };

export function Field({
  label,
  name,
  error,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error?.[0] && (
        <p id={`${name}-error`} role="alert" className="text-xs text-destructive">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  name,
  state,
  ...props
}: { label: string; name: string; state?: ActionState } & React.ComponentProps<typeof Input>) {
  const error = state?.fieldErrors?.[name];
  return (
    <Field label={label} name={name} error={error}>
      <Input id={name} name={name} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} {...props} />
    </Field>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  placeholder = "Elegir…",
  state,
}: {
  label: string;
  name: string;
  options: readonly Option[];
  defaultValue?: string;
  placeholder?: string;
  state?: ActionState;
}) {
  return (
    <Field label={label} name={name} error={state?.fieldErrors?.[name]}>
      <Select name={name} items={options as Option[]} defaultValue={defaultValue}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function SubmitButton({
  pending,
  children,
  className,
}: {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

/** Botón "Nuevo X" que abre un diálogo con un formulario conectado a una Server Action. */
export function FormDialog({
  title,
  description,
  trigger,
  action,
  successMessage,
  children,
}: {
  title: string;
  description?: string;
  trigger: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  successMessage: string;
  children: (state: ActionState) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = React.useActionState(action, {});
  const handled = React.useRef(state);

  React.useEffect(() => {
    if (state !== handled.current && state.ok) {
      handled.current = state;
      setOpen(false);
      toast.success(successMessage);
    }
  }, [state, successMessage]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> {trigger}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form action={formAction} className="grid gap-3">
          {children(state)}
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <SubmitButton pending={pending}>Guardar</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Select inline que dispara una Server Action al cambiar (cambio de etapa, estado, etc.). */
export function InlineSelect({
  id,
  value,
  options,
  action,
  className,
}: {
  id: string;
  value: string;
  options: readonly Option[];
  action: (id: string, value: string) => Promise<void>;
  className?: string;
}) {
  const [pending, startTransition] = React.useTransition();
  return (
    <Select
      items={options as Option[]}
      value={value}
      disabled={pending}
      onValueChange={(v) => {
        if (typeof v === "string" && v !== value) startTransition(() => action(id, v));
      }}
    >
      <SelectTrigger size="sm" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
