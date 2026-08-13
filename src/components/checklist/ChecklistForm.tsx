"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerMap, ChecklistTemplate, ItemAnswer } from "@/lib/types";
import { allItemsOf } from "@/lib/template";
import { ChecklistItemRow } from "@/components/checklist/ChecklistItemRow";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ChecklistForm({
  inspectionId,
  template,
  initialAnswers,
}: {
  inspectionId: string;
  template: ChecklistTemplate;
  initialAnswers: AnswerMap;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useMemo(() => allItemsOf(template), [template]);
  const answeredCount = items.filter((item) => Boolean(answers[item.id]?.status)).length;
  const progressPct = items.length > 0 ? Math.round((answeredCount / items.length) * 100) : 0;

  const persist = useCallback(
    async (nextAnswers: AnswerMap) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/inspeksi/${inspectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: nextAnswers }),
        });
        if (!res.ok) throw new Error();
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [inspectionId]
  );

  function updateItem(itemId: string, next: ItemAnswer) {
    setAnswers((prev) => {
      const updated = { ...prev, [itemId]: next };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(updated), 600);
      return updated;
    });
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function handleFinish() {
    setSubmitting(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      await persist(answers);
      const res = await fetch(`/api/inspeksi/${inspectionId}/selesai`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.push(`/inspeksi/${inspectionId}/hasil`);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="space-y-8">
        {template.sections.map((section) => (
          <section key={section.title} aria-labelledby={`section-${section.title}`}>
            <div className="mb-3">
              <h2 id={`section-${section.title}`} className="font-display text-lg font-semibold text-[var(--ink)]">
                {section.title}
              </h2>
              {section.deskripsi && <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{section.deskripsi}</p>}
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  answer={answers[item.id] ?? {}}
                  onChange={(next) => updateItem(item.id, next)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--line)] bg-[var(--surface-raised)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div className="h-full bg-[var(--brand)] transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-1 font-data text-xs text-[var(--ink-soft)]">
              {answeredCount}/{items.length} terisi
              {saveState === "saving" && " · Menyimpan…"}
              {saveState === "saved" && " · Tersimpan"}
              {saveState === "error" && " · Gagal menyimpan, coba lagi"}
            </p>
          </div>
          <Button onClick={handleFinish} disabled={submitting} className="shrink-0">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lihat hasil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
