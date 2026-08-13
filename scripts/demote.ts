import "dotenv/config";
import { prisma } from "@/lib/db";
import { evaluateDemotions } from "@/lib/feedback";

/**
 * Menjalankan algoritma demote (docs/prd.md §6.2) di luar UI, mis. dari cron.
 * Tambahkan `--dry` untuk melihat calon perubahan tanpa menerapkan.
 */
async function main() {
  const dryRun = process.argv.includes("--dry");
  const perubahan = await evaluateDemotions({ dryRun, actor: "cli" });

  if (perubahan.length === 0) {
    console.log("Tidak ada item yang melewati ambang.");
    return;
  }

  for (const change of perubahan) {
    console.log(
      `${change.templateKey} v${change.version} ${change.itemId}: ${change.from} → ${change.to} (${change.flagIrrelevant}/${change.impressions})`,
    );
  }
  console.log(
    dryRun
      ? `${perubahan.length} item akan diturunkan (dry run).`
      : `${perubahan.length} item diturunkan.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
