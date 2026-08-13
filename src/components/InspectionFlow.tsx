"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChecklistTemplate, ItemAnswer, VehicleOption } from "@/types/checklist";
import { ChecklistItemForm } from "./ChecklistItemForm";
import { Header } from "./Header";
import { generateInspectionId, saveInspection } from "@/lib/storage";

interface InspectionFlowProps {
  vehicle: VehicleOption;
  template: ChecklistTemplate;
}

export function InspectionFlow({ vehicle, template }: InspectionFlowProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Map<string, ItemAnswer>>(new Map());
  const [activeSection, setActiveSection] = useState(0);

  const section = template.sections[activeSection];
  const totalSections = template.sections.length;

  const progress = useMemo(() => {
    const allItems = template.sections.flatMap((s) => s.items);
    const answered = allItems.filter((item) => {
      const a = answers.get(item.id);
      if (!a || a.value === null || a.value === "") return false;
      if (item.wajib_foto && !a.photoDataUrl) return false;
      return true;
    });
    return Math.round((answered.length / allItems.length) * 100);
  }, [answers, template]);

  const handleAnswer = (answer: ItemAnswer) => {
    setAnswers((prev) => new Map(prev).set(answer.itemId, answer));
  };

  const handleFinish = () => {
    const id = generateInspectionId();
    const inspection = {
      id,
      vehicle,
      templateId: template.template_id,
      templateVersion: template.version,
      answers: Array.from(answers.values()),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    saveInspection(inspection);
    router.push(`/report/${id}`);
  };

  return (
    <div className="min-h-dvh bg-surface">
      <Header backHref="/mulai" title={vehicle.label} />

      <div className="mx-auto max-w-lg px-4 py-4">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/60">
              Bagian {activeSection + 1} dari {totalSections}
            </span>
            <span className="font-mono text-xs text-ink/50">{progress}% selesai</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section nav pills */}
        <div className="mb-4 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {template.sections.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActiveSection(i)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                i === activeSection
                  ? "bg-brand text-white"
                  : "bg-white text-ink/70 border border-line"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
          {section.deskripsi && (
            <p className="mt-1 text-sm text-ink/70">{section.deskripsi}</p>
          )}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {section.items.map((item, idx) => (
            <ChecklistItemForm
              key={item.id}
              item={item}
              answer={answers.get(item.id)}
              index={idx}
              onChange={handleAnswer}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {activeSection > 0 && (
            <button
              type="button"
              onClick={() => setActiveSection((s) => s - 1)}
              className="btn-secondary flex-1"
            >
              Sebelumnya
            </button>
          )}
          {activeSection < totalSections - 1 ? (
            <button
              type="button"
              onClick={() => setActiveSection((s) => s + 1)}
              className="btn-primary flex-1"
            >
              Lanjut
            </button>
          ) : (
            <button type="button" onClick={handleFinish} className="btn-primary flex-1">
              Lihat hasil
            </button>
          )}
        </div>

        {template.meta?.disclaimer && (
          <p className="mt-6 text-xs leading-relaxed text-ink/50">{template.meta.disclaimer}</p>
        )}
      </div>
    </div>
  );
}
