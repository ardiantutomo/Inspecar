import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTemplateSnapshot } from "@/lib/template";
import { computeVerdict, VERDICT_LABEL } from "@/lib/verdict";
import type { AnswerMap } from "@/lib/types";
import type { Verdict } from "@/lib/types";

const VERDICT_TEXT_COLOR: Record<Verdict, string> = {
  go: "text-[var(--clear)]",
  "hati-hati": "text-[var(--caution)]",
  "no-go": "text-[var(--critical)]",
};

export const metadata = { title: "Riwayat inspeksi — Periksa Dulu" };

export default async function AkunPage() {
  const user = await requireUser();
  const inspections = await prisma.inspection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">Riwayat inspeksi</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Halo, {user.name}.</p>
        </div>
        <LinkButton href="/mulai">Inspeksi baru</LinkButton>
      </div>

      {inspections.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-md)] border border-dashed border-[var(--line-strong)] p-10 text-center">
          <p className="text-sm text-[var(--ink-soft)]">Belum ada inspeksi. Mulai yang pertama sekarang.</p>
          <LinkButton href="/mulai" className="mt-4">
            Mulai inspeksi
          </LinkButton>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {inspections.map((inspection) => {
            const template = parseTemplateSnapshot(inspection.templateSnapshot);
            const answers = JSON.parse(inspection.answers) as AnswerMap;
            const result = computeVerdict(template, answers);
            const href = inspection.status === "selesai" ? `/inspeksi/${inspection.id}/hasil` : `/inspeksi/${inspection.id}`;

            return (
              <li key={inspection.id}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)] p-4 hover:border-[var(--brand)]"
                >
                  <div>
                    <p className="font-medium text-[var(--ink)]">
                      {inspection.brand} {inspection.model}
                      <span className="font-data ml-2 text-xs text-[var(--ink-soft)]">{inspection.yearRange}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                      {inspection.status === "selesai" ? "Selesai" : "Draft — belum selesai"} ·{" "}
                      {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(inspection.createdAt)}
                    </p>
                  </div>
                  {inspection.status === "selesai" ? (
                    <span className={`shrink-0 font-display text-sm font-semibold ${VERDICT_TEXT_COLOR[result.verdict]}`}>
                      {VERDICT_LABEL[result.verdict]}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--line)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                      Draft
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
