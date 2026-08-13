"use client";

import { AppShell } from "@/components/AppShell";
import { VerdictStamp } from "@/components/VerdictStamp";
import { SectionCard, SeverityBadge } from "@/components/ui";
import { summarizeInspection } from "@/lib/scoring";
import { buildTemplate } from "@/lib/templates";
import type { Inspection } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function BagikanPage() {
  const params = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/share?id=${params.id}`);
        if (!res.ok) {
          if (!cancelled) setError("Laporan tidak ditemukan atau sudah kedaluwarsa.");
          return;
        }
        const data = (await res.json()) as Inspection;
        if (!cancelled) setInspection(data);
      } catch {
        if (!cancelled) setError("Gagal memuat laporan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const template = useMemo(() => {
    if (!inspection) return null;
    return buildTemplate(
      inspection.brand,
      inspection.model,
      inspection.year_range,
    );
  }, [inspection]);

  const summary = useMemo(() => {
    if (!inspection || !template) return null;
    return summarizeInspection(template, inspection.answers);
  }, [inspection, template]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-ink-muted">Memuat laporan…</p>
      </AppShell>
    );
  }

  if (error || !inspection || !summary) {
    return (
      <AppShell>
        <SectionCard>
          <h1 className="font-display text-xl font-semibold">Laporan tidak tersedia</h1>
          <p className="mt-2 text-sm text-ink-muted">{error}</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand">
            Ke beranda CekMobil
          </Link>
        </SectionCard>
      </AppShell>
    );
  }

  const findings = summary.findings.filter(
    (f) => f.level === "critical" || f.level === "caution",
  );

  return (
    <AppShell>
      <div className="mb-4">
        <p className="text-sm font-medium text-brand">Laporan bersama</p>
        <h1 className="font-display mt-1 text-2xl font-semibold">
          {inspection.brand} {inspection.model}
        </h1>
        <p className="font-data mt-1 text-sm text-ink-muted">
          {inspection.year_range}
          {inspection.plate ? ` · ${inspection.plate}` : ""}
        </p>
      </div>

      <VerdictStamp verdict={summary.verdict} score={summary.score} />

      <SectionCard>
        <h2 className="font-display text-lg font-semibold">Temuan</h2>
        {findings.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Tidak ada temuan kritis yang dilaporkan.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {findings.map((f) => (
              <li key={f.itemId} className="border-b border-line pb-3 last:border-0">
                <div className="flex gap-2">
                  <SeverityBadge severity={f.severity} />
                </div>
                <p className="mt-1 font-medium">{f.label}</p>
                <p className="mt-1 text-sm text-ink-muted">{f.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {summary.negoPoints.length > 0 && (
        <SectionCard className="mt-4">
          <h2 className="font-display text-lg font-semibold">Poin nego</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {summary.negoPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </SectionCard>
      )}

      <p className="mt-5 text-xs leading-relaxed text-ink-muted">{summary.disclaimer}</p>

      <Link
        href="/pilih"
        className="tap-target mt-6 inline-flex w-full items-center justify-center rounded-[6px] bg-brand text-sm font-medium text-white"
      >
        Mulai inspeksi sendiri
      </Link>
    </AppShell>
  );
}
