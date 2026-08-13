"use client";

import { useActionState } from "react";
import { type AuthState, masukAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

export function MasukForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    masukAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lanjut" value={next} />
      <FormError>{state.error}</FormError>

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
        />
      </Field>

      <Field label="Kata sandi" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </Button>
    </form>
  );
}
