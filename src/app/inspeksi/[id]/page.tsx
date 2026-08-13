"use client";

import { AppShell } from "@/components/AppShell";
import { ChecklistItemCard } from "@/components/ChecklistItemCard";
import { BetaBadge, Button, SectionCard } from "@/components/ui";
import { getInspection, saveInspection } from "@/lib/storage";
import { buildTemplate } from "@/lib/templates";
import type { Inspection, ItemAnswer } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function InspeksiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = getInspection(params.id);
    setInspection(found);
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

  useEffect(() => {
    if (!inspection || !template) return;
    if (
      inspection.template_id !== template.template_id ||
      inspection.template_version !== template.version
    ) {
      const next = {
        ...inspection,
        template_id: template.template_id,
        template_version: template.version,
      };
      saveInspection(next);
      setInspection(next);
    }
  }, [inspection, template]);

  if (!ready) {
    return (
      <AppShell>
        <p className="text-sm text-ink-muted">Memuat inspeksi…</p>
      </AppShell>
    );
  }

  if (!inspection || !template) {
    return (
      <AppShell>
        <SectionCard>
          <h1 className="font-display text-xl font-semibold">Inspeksi tidak ditemukan</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Data hanya tersimpan di perangkat ini. Mulai inspeksi baru.
          </p>
          <Link href="/pilih" className="mt-4 inline-block text-sm font-medium text-brand">
            Pilih kendaraan
          </Link>
        </SectionCard>
      </AppShell>
    );
  }

  const sectionIndex = Math.min(
    inspection.currentSectionIndex,
    template.sections.length - 1,
  );
  const section = template.sections[sectionIndex];
  const totalItems = template.sections.reduce((n, s) => n + s.items.length, 0);
  const answered = Object.values(inspection.answers).filter(
    (a) => a.value !== null && a.value !== undefined && a.value !== "",
  ).length;
  const progress = Math.round((answered / Math.max(totalItems, 1)) * 100);

  function persist(next: Inspection) {
    saveInspection(next);
    setInspection(next);
  }

  function updateAnswer(itemId: string, answer: ItemAnswer) {
    persist({
      ...inspection!,
      answers: { ...inspection!.answers, [itemId]: answer },
    });
  }

  function goSection(delta: number) {
    const nextIndex = Math.max(
      0,
      Math.min(template!.sections.length - 1, sectionIndex + delta),
    );
    persist({ ...inspection!, currentSectionIndex: nextIndex });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell>
      <div className="sticky top-14 z-30 -mx-4 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              {inspection.brand} {inspection.model}
            </p>
            <p className="font-data text-xs text-ink-muted">
              {inspection.year_range}
              {inspection.plate ? ` · ${inspection.plate}` : ""}
            </p>
          </div>
          <p className="font-data text-sm text-brand">{progress}%</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="animate-rise mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-brand">
            Bagian {sectionIndex + 1}/{template.sections.length}
          </p>
          {section.tier === "B" && <BetaBadge />}
        </div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink">
          {section.title}
        </h1>
        {section.deskripsi && (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {section.deskripsi}
          </p>
        )}
        {section.tier === "B" && (
          <p className="mt-3 rounded-[6px] border border-caution/30 bg-caution-soft px-3 py-2 text-xs leading-relaxed text-caution">
            Section ini belum terverifikasi penuh. Gunakan sebagai petunjuk tambahan.
          </p>
        )}
      </div>

      <SectionCard className="animate-rise delay-1 mt-5 !p-0 px-4 sm:px-5">
        {section.items.map((item, idx) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            index={idx}
            isBeta={section.tier === "B"}
            answer={inspection.answers[item.id]}
            onChange={(next) => updateAnswer(item.id, next)}
          />
        ))}
      </SectionCard>

      <div className="mt-5 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={sectionIndex === 0}
          onClick={() => goSection(-1)}
        >
          Sebelumnya
        </Button>
        {sectionIndex < template.sections.length - 1 ? (
          <Button type="button" className="flex-1" onClick={() => goSection(1)}>
            Lanjut
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            onClick={() => router.push(`/hasil/${inspection.id}`)}
          >
            Lihat hasil
          </Button>
        )}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {template.sections.map((s, i) => (
          <button
            key={`${s.title}-${i}`}
            type="button"
            onClick={() =>
              persist({ ...inspection, currentSectionIndex: i })
            }
            className={`shrink-0 rounded-[6px] border px-3 py-2 text-xs ${
              i === sectionIndex
                ? "border-brand bg-brand-soft text-brand-deep"
                : "border-line bg-surface-raised text-ink-muted"
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
