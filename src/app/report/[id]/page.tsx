"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { VerdictCard } from "@/components/VerdictCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { getTierATemplate } from "@/lib/template";
import { calculateVerdict } from "@/lib/verdict";
import {
  decodeInspectionFromShare,
  encodeInspectionForShare,
  getInspection,
} from "@/lib/storage";
import { Inspection } from "@/types/checklist";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fromStorage = getInspection(id);
    if (fromStorage) {
      setInspection(fromStorage);
      return;
    }

    // Try share param
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get("d");
    if (data) {
      const decoded = decodeInspectionFromShare(data);
      if (decoded) setInspection(decoded);
    }
  }, [id]);

  useEffect(() => {
    if (!inspection) return;
    const encoded = encodeInspectionForShare(inspection);
    const url = `${window.location.origin}/report/share?d=${encoded}`;
    setShareUrl(url);
  }, [inspection]);

  const template = getTierATemplate();
  const verdict = inspection ? calculateVerdict(template, inspection.answers) : null;

  const answerMap = new Map(inspection?.answers.map((a) => [a.itemId, a]) ?? []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!inspection || !verdict) {
    return (
      <div className="min-h-dvh bg-surface">
        <Header backHref="/" title="Hasil inspeksi" />
        <div className="mx-auto max-w-lg px-4 py-8 text-center">
          <p className="text-ink/70">Laporan tidak ditemukan atau sudah kedaluwarsa.</p>
          <Link href="/mulai" className="btn-primary mt-4 inline-flex">
            Mulai inspeksi baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface">
      <Header backHref="/" title="Hasil inspeksi" />

      <main className="mx-auto max-w-lg px-4 py-4 pb-8">
        <VerdictCard
          verdict={verdict.verdict}
          title={verdict.title}
          summary={verdict.summary}
          vehicleLabel={inspection.vehicle.label}
        />

        {verdict.majorIssues.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-critical">Temuan major</h2>
            <ul className="mt-2 space-y-2">
              {verdict.majorIssues.map((issue) => (
                <li key={issue} className="card px-4 py-3 text-sm text-ink">{issue}</li>
              ))}
            </ul>
          </section>
        )}

        {verdict.minorIssues.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-caution">Temuan minor (bahan nego)</h2>
            <ul className="mt-2 space-y-2">
              {verdict.minorIssues.map((issue) => (
                <li key={issue} className="card px-4 py-3 text-sm text-ink">{issue}</li>
              ))}
            </ul>
          </section>
        )}

        {verdict.unansweredMajor.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink/70">Belum dicek (major)</h2>
            <ul className="mt-2 space-y-2">
              {verdict.unansweredMajor.map((issue) => (
                <li key={issue} className="card px-4 py-3 text-sm text-ink/60">{issue}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Detail per section */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Detail checklist</h2>
          <div className="mt-3 space-y-4">
            {template.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-medium text-ink">{section.title}</h3>
                <ul className="mt-2 space-y-2">
                  {section.items.map((item) => {
                    const answer = answerMap.get(item.id);
                    const display =
                      answer?.value === true
                        ? "OK"
                        : answer?.value === false
                          ? "Masalah"
                          : answer?.value != null && answer?.value !== ""
                            ? String(answer.value)
                            : "—";
                    return (
                      <li key={item.id} className="card flex items-center justify-between gap-2 px-3 py-2">
                        <span className="min-w-0 text-sm text-ink">{item.label}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          <SeverityBadge severity={item.severity} />
                          <span className="font-mono text-xs text-ink/70">{display}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Share */}
        <section className="mt-8 card p-4">
          <h2 className="text-sm font-semibold text-ink">Bagikan ke keluarga</h2>
          <p className="mt-1 text-sm text-ink/60">
            Kirim link ini untuk diskusi sebelum kamu putuskan beli atau nego.
          </p>
          <button type="button" onClick={handleCopy} className="btn-secondary mt-3 w-full">
            {copied ? "Link disalin" : "Salin link laporan"}
          </button>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-ink/45">
          {template.meta?.disclaimer ??
            "Hasil checklist ini adalah alat bantu keputusan, bukan jaminan kondisi kendaraan."}
        </p>

        <Link href="/mulai" className="btn-primary mt-6 flex w-full">
          Inspeksi mobil lain
        </Link>
      </main>
    </div>
  );
}
