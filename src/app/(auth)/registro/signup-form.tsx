"use client";

import { useActionState } from "react";
import { SubmitButton, TextField } from "@/components/form-bits";
import { signup } from "@/lib/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, {});

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg border bg-muted/50 p-3 text-sm">
        Cuenta creada. Revisa tu correo y abre el enlace de confirmación para ingresar.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3" noValidate>
      <TextField label="Nombre" name="full_name" autoComplete="name" required state={state} />
      <TextField label="Correo" name="email" type="email" autoComplete="email" required state={state} />
      <TextField label="Contraseña (mín. 8)" name="password" type="password" autoComplete="new-password" required state={state} />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton pending={pending}>Crear cuenta</SubmitButton>
    </form>
  );
}
