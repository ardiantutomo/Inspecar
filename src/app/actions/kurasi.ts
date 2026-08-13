"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { evaluateDemotions } from "@/lib/feedback";

export async function terapkanDemoteAction(): Promise<{ pesan?: string }> {
  const admin = await requireAdmin();
  const perubahan = await evaluateDemotions({ actor: admin.email });

  revalidatePath("/kurasi");

  return {
    pesan:
      perubahan.length === 0
        ? "Tidak ada yang perlu diturunkan."
        : `${perubahan.length} item diturunkan, versi template dinaikkan.`,
  };
}
