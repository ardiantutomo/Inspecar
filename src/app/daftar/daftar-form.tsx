"use client";

import { useActionState } from "react";
import { type AuthState, daftarAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

export function DaftarForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    daftarAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lanjut" value={next} />
      <FormError>{state.error}</FormError>

      <Field label="Nama" htmlFor="name">
        <Input id="name" name="name" autoComplete="name" required minLength={2} />
      </Field>

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

      <Field label="Kata sandi" hint="Minimal 8 karakter." htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Membuat akun…" : "Buat akun"}
      </Button>
    </form>
  );
}
