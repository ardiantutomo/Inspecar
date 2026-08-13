"use client";

import { AppShell } from "@/components/AppShell";
import { VerdictStamp } from "@/components/VerdictStamp";
import { Button, SectionCard, SeverityBadge } from "@/components/ui";
import {
  getInspection,
  publishShare,
  saveInspection,
} from "@/lib/storage";
import { summarizeInspection } from "@/lib/scoring";
import { buildTemplate } from "@/lib/templates";
import type { Inspection } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function HasilPage() {
  const params = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [ready, setReady] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    setInspection(getInspection(params.id));
    setReady(true);
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

  if (!ready) {
    return (
      <AppShell>
        <p className="text-sm text-ink-muted">Menyusun hasil…</p>
      </AppShell>
    );
  }

  if (!inspection || !template || !summary) {
    return (
      <AppShell>
        <SectionCard>
          <h1 className="font-display text-xl font-semibold">Hasil tidak ditemukan</h1>
          <Link href="/pilih" className="mt-3 inline-block text-sm font-medium text-brand">
            Mulai inspeksi baru
          </Link>
        </SectionCard>
      </AppShell>
    );
  }

  const previewFindings = summary.findings.filter(
    (f) => f.level === "critical" || f.level === "caution",
  );
  const locked = !inspection.unlocked;

  async function unlock() {
    setUnlocking(true);
    // Simulasi pembayaran freemium (MVP)
    await new Promise((r) => setTimeout(r, 700));
    const next = { ...inspection!, unlocked: true };
    saveInspection(next);
    setInspection(next);
    setUnlocking(false);
  }

  async function share() {
    setShareError(null);
    try {
      const id = await publishShare(inspection!);
      const url = `${window.location.origin}/bagikan/${id}`;
      setShareUrl(url);
    } catch {
      setShareError("Gagal membuat tautan. Coba lagi.");
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 1500);
  }

  return (
    <AppShell>
      <div className="animate-rise mb-4">
        <p className="text-sm font-medium text-brand">Hasil inspeksi</p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
          {inspection.brand} {inspection.model}
        </h1>
        <p className="font-data mt-1 text-sm text-ink-muted">
          {inspection.year_range}
          {inspection.year ? ` · ${inspection.year}` : ""}
          {inspection.plate ? ` · ${inspection.plate}` : ""}
        </p>
      </div>

      <VerdictStamp verdict={summary.verdict} score={summary.score} />

      <div className="animate-rise delay-1 grid grid-cols-3 gap-2">
        {[
          { label: "Kritis", value: summary.criticalCount, tone: "text-critical" },
          { label: "Perlu cek", value: summary.cautionCount, tone: "text-caution" },
          { label: "Aman", value: summary.okCount, tone: "text-clear" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[8px] border border-line bg-surface-raised px-3 py-3 text-center"
          >
            <p className={`font-data text-xl font-semibold ${s.tone}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {locked ? (
        <SectionCard className="animate-rise delay-2 mt-5">
          <h2 className="font-display text-lg font-semibold">Buka report lengkap</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Checklist dasar sudah gratis. Report lengkap berisi daftar temuan, poin nego,
            dan tautan berbagi untuk keluarga.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink">
            <li>· Ringkasan temuan major & minor</li>
            <li>· Poin negosiasi harga</li>
            <li>· Share link laporan</li>
          </ul>
          <div className="mt-4 rounded-[6px] bg-surface px-3 py-3">
            <p className="font-data text-lg font-semibold text-ink">Rp 29.000</p>
            <p className="text-xs text-ink-muted">Simulasi pembayaran (demo MVP)</p>
          </div>
          <Button className="mt-4 w-full" onClick={unlock} disabled={unlocking}>
            {unlocking ? "Memproses…" : "Bayar & buka report"}
          </Button>
          {previewFindings.length > 0 && (
            <div className="relative mt-5">
              <p className="mb-2 text-sm font-medium text-ink">Pratinjau temuan</p>
              <div className="max-h-40 space-y-2 overflow-hidden blur-[2px]">
                {previewFindings.slice(0, 3).map((f) => (
                  <div key={f.itemId} className="rounded-[6px] border border-line px-3 py-2 text-sm">
                    {f.label}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-raised to-transparent" />
            </div>
          )}
        </SectionCard>
      ) : (
        <>
          <SectionCard className="animate-rise delay-2 mt-5">
            <h2 className="font-display text-lg font-semibold">Temuan penting</h2>
            {previewFindings.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Tidak ada temuan kritis dari item yang sudah diisi.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {previewFindings.map((f) => (
                  <li
                    key={f.itemId}
                    className="rounded-[6px] border border-line px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={f.severity} />
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide ${
                          f.level === "critical" ? "text-critical" : "text-caution"
                        }`}
                      >
                        {f.level === "critical" ? "Kritis" : "Perlu cek"}
                      </span>
                    </div>
                    <p className="mt-1.5 font-medium text-ink">{f.label}</p>
                    <p className="mt-1 text-sm text-ink-muted">{f.detail}</p>
                    <p className="font-data mt-2 text-xs text-ink-muted">
                      {f.sectionTitle} · {f.estimasi}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard className="mt-4">
            <h2 className="font-display text-lg font-semibold">Poin nego</h2>
            {summary.negoPoints.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Belum ada amunisi nego dari temuan saat ini.
              </p>
            ) : (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
                {summary.negoPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard className="mt-4">
            <h2 className="font-display text-lg font-semibold">Bagikan ke keluarga</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Kirim tautan hasil inspeksi sebelum memutuskan bayar.
            </p>
            <Button className="mt-4 w-full" variant="secondary" onClick={share}>
              Buat tautan berbagi
            </Button>
            {shareUrl && (
              <div className="mt-3 rounded-[6px] bg-surface px-3 py-3">
                <p className="font-data break-all text-xs text-ink">{shareUrl}</p>
                <Button className="mt-3 w-full" onClick={copyLink}>
                  {copyOk ? "Tersalin" : "Salin tautan"}
                </Button>
              </div>
            )}
            {shareError && (
              <p className="mt-2 text-sm text-critical">{shareError}</p>
            )}
          </SectionCard>
        </>
      )}

      <SectionCard className="mt-4 bg-surface">
        <p className="text-xs leading-relaxed text-ink-muted">{summary.disclaimer}</p>
        {summary.unansweredCount > 0 && (
          <p className="mt-2 text-xs text-caution">
            {summary.unansweredCount} item belum diisi — hasil bisa berubah setelah dilengkapi.
          </p>
        )}
      </SectionCard>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/inspeksi/${inspection.id}`}
          className="tap-target inline-flex flex-1 items-center justify-center rounded-[6px] border border-line bg-surface-raised text-sm font-medium"
        >
          Lanjut isi checklist
        </Link>
        <Link
          href="/pilih"
          className="tap-target inline-flex flex-1 items-center justify-center rounded-[6px] bg-brand text-sm font-medium text-white"
        >
          Inspeksi mobil lain
        </Link>
      </div>
    </AppShell>
  );
}
