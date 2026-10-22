"use client";

import { useActionState } from "react";
import { SubmitButton, TextField } from "@/components/form-bits";
import { login } from "@/lib/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="grid gap-3" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <TextField label="Correo" name="email" type="email" autoComplete="email" required state={state} />
      <TextField label="Contraseña" name="password" type="password" autoComplete="current-password" required state={state} />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton pending={pending}>Ingresar</SubmitButton>
    </form>
  );
}
