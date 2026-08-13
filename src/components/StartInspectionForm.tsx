"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function StartInspectionForm({
  brand,
  model,
  yearStart,
  yearEnd,
}: {
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
}) {
  const router = useRouter();
  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearEnd - i);
  const [year, setYear] = useState(years[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/inspeksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, year }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal membuat inspeksi. Coba lagi.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    router.push(`/inspeksi/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
          Tahun kendaraan
        </label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="tap-target font-data w-full rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 text-[15px] text-[var(--ink)] focus:border-[var(--brand)]"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-[var(--critical)]">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Menyiapkan checklist…" : "Mulai inspeksi"}
      </Button>
    </form>
  );
}
