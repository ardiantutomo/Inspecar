"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { VerdictCard } from "@/components/VerdictCard";
import { decodeInspectionFromShare } from "@/lib/storage";
import { getTierATemplate } from "@/lib/template";
import { calculateVerdict } from "@/lib/verdict";
import { Inspection } from "@/types/checklist";

function ShareReportContent() {
  const params = useSearchParams();
  const [inspection, setInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    const data = params.get("d");
    if (data) {
      const decoded = decodeInspectionFromShare(data);
      setInspection(decoded);
    }
  }, [params]);

  const template = getTierATemplate();
  const verdict = inspection ? calculateVerdict(template, inspection.answers) : null;

  if (!inspection || !verdict) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <p className="text-ink/70">Link laporan tidak valid atau sudah kedaluwarsa.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">Ke halaman utama</Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-4">
      <p className="mb-4 text-sm text-ink/60">Laporan inspeksi dibagikan</p>
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
              <li key={issue} className="card px-4 py-3 text-sm">{issue}</li>
            ))}
          </ul>
        </section>
      )}
      <Link href="/" className="btn-primary mt-8 flex w-full">
        Buat inspeksi sendiri
      </Link>
    </main>
  );
}

export default function ShareReportPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <Header title="Laporan dibagikan" />
      <Suspense fallback={<div className="p-8 text-center text-ink/60">Memuat...</div>}>
        <ShareReportContent />
      </Suspense>
    </div>
  );
}
