"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mendaftar. Coba lagi.");
      setLoading(false);
      return;
    }
    router.push("/mulai");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Nama" name="name" type="text" autoComplete="name" required />
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField label="Password" name="password" type="password" autoComplete="new-password" minLength={6} required />
      {error && <p className="text-sm text-[var(--critical)]">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Mendaftar…" : "Daftar"}
      </Button>
    </form>
  );
}
