import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormBagian } from "@/app/inspeksi/[id]/bagian/[bagian]/form-bagian";
import { Page } from "@/components/ui/sheet";
import { requireUser } from "@/lib/auth";
import { loadWorkspace } from "@/lib/workspace";

export const metadata: Metadata = { title: "Bagian pemeriksaan" };

export default async function BagianPage({
  params,
}: PageProps<"/inspeksi/[id]/bagian/[bagian]">) {
  const { id, bagian } = await params;
  const user = await requireUser(`/inspeksi/${id}/bagian/${bagian}`);
  const ws = await loadWorkspace(id, user.id);
  if (!ws) notFound();

  const posisi = ws.sections.findIndex((section) => section.key === bagian);
  if (posisi === -1) notFound();

  const section = ws.sections[posisi];
  const sebelum = ws.sections[posisi - 1];
  const sesudah = ws.sections[posisi + 1];

  return (
    <Page width="narrow" className="pb-28">
      <div className="mb-5">
        <Link
          href={`/inspeksi/${ws.inspection.id}`}
          className="micro-label underline underline-offset-4"
        >
          ← {ws.vehicle.brand} {ws.vehicle.model}
        </Link>
        <p className="micro-label mt-3">
          Bagian {posisi + 1} dari {ws.sections.length}
          {section.severity === "major" ? " · penting" : ""}
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-[28px]">{section.title}</h1>
        {section.deskripsi && (
          <p className="mt-3 text-[15px] text-ink-soft">{section.deskripsi}</p>
        )}
      </div>

      <FormBagian
        inspectionId={ws.inspection.id}
        sectionKey={section.key}
        items={section.items}
        answers={ws.answers}
        photos={ws.photos}
        terkunci={ws.inspection.status === "selesai"}
        navigasi={{
          sebelum: sebelum
            ? { key: sebelum.key, title: sebelum.title }
            : null,
          sesudah: sesudah ? { key: sesudah.key, title: sesudah.title } : null,
        }}
      />
    </Page>
  );
}
