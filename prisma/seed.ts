import "dotenv/config";
import { hashPassword } from "@/lib/auth";
import { allVisibleItems } from "@/lib/checklist/schema";
import { resolveTemplate } from "@/lib/checklist/template-service";
import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";

/**
 * Isi awal untuk development: satu admin, satu akun demo, dan satu inspeksi yang
 * sudah selesai + terbayar supaya report & share link bisa langsung dilihat.
 *
 * Jalankan: npm run db:seed
 */

const KATA_SANDI = "rahasia123";

// Jawaban demo: campuran aman, perlu perhatian, dan satu masalah berat, supaya
// putusan yang keluar bukan "layak" kosong.
const JAWABAN_DEMO: Record<string, { result: string; detail?: string }> = {
  doc_rangka_match: { result: "aman" },
  doc_mesin_match: { result: "aman" },
  doc_bpkb_asli: { result: "aman" },
  doc_pajak_blokir: { result: "aman", detail: "Pajak hidup sampai Mei 2027, tidak ada blokir" },
  flood_lumpur_tersembunyi: { result: "aman" },
  flood_bau_jamur: { result: "aman" },
  flood_kabel_korosi: { result: "aman" },
  flood_kelistrikan_fungsi: { result: "aman" },
  crash_celah_panel: { result: "perhatian", detail: "Celah kap kanan sedikit lebih lebar" },
  crash_las_potong: { result: "aman" },
  crash_cat_ulang: { result: "perhatian", detail: "Fender kanan beda tekstur, ada overspray di karet" },
  eng_kondisi_dingin: { result: "aman" },
  eng_asap_knalpot: { result: "aman" },
  eng_oli_air: { result: "aman" },
  eng_bocor_oli: { result: "bahaya", detail: "Rembes basah di area gasket, ada tetesan di lantai" },
  eng_overheat: { result: "aman" },
  trans_matic: { result: "perhatian", detail: "Ada jeda sedikit saat pindah dari 2 ke 3" },
  odo_kewajaran: { result: "perhatian", detail: "138000" },
  susp_bunyi: { result: "bahaya", detail: "Bunyi gluduk jelas dari roda depan kiri" },
  ban_kondisi: { result: "perhatian", detail: "Alur depan tipis, produksi 2019" },
  rem_fungsi: { result: "aman" },
  ac_dingin: { result: "aman" },
  listrik_fitur: { result: "aman" },
  dashboard_indikator: { result: "aman" },
  td_setir_lurus: { result: "aman" },
  td_tarikan_getaran: { result: "aman" },
};

async function main() {
  const passwordHash = await hashPassword(KATA_SANDI);

  const admin = await prisma.user.upsert({
    where: { email: "admin@contoh.id" },
    create: {
      email: "admin@contoh.id",
      name: "Admin Kurasi",
      passwordHash,
      role: "admin",
    },
    update: { role: "admin" },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@contoh.id" },
    create: { email: "demo@contoh.id", name: "Pembeli Demo", passwordHash },
    update: {},
  });

  const template = await resolveTemplate({
    brand: "Toyota",
    model: "Avanza",
    yearRange: "2012-2015",
  });

  const sudahAda = await prisma.inspection.findFirst({
    where: { userId: demo.id, templateKey: template.key },
  });

  if (!sudahAda) {
    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: demo.id,
        brand: "Toyota",
        model: "Avanza",
        yearRange: "2012-2015",
        year: 2014,
        variant: "1.3 G",
        transmission: "matic",
        plateNo: "B 1234 XYZ",
      },
    });

    const inspection = await prisma.inspection.create({
      data: {
        userId: demo.id,
        vehicleId: vehicle.id,
        templateKey: template.key,
        templateVersion: template.version,
        odometerKm: 138_000,
        askingPrice: 132_000_000,
        sellerNote: "Penjual mengaku baru ganti oli dan kampas rem depan.",
        status: "selesai",
        completedAt: new Date(),
        paidAt: new Date(),
        shareToken: randomBytes(12).toString("hex"),
      },
    });

    const items = allVisibleItems(template.doc, "matic");
    for (const item of items) {
      const jawaban = JAWABAN_DEMO[item.id];
      if (!jawaban) continue;
      await prisma.answer.create({
        data: {
          inspectionId: inspection.id,
          itemId: item.id,
          sectionKey: "seed",
          result: jawaban.result,
          detail: jawaban.detail ?? null,
        },
      });
    }

    await prisma.payment.create({
      data: {
        userId: demo.id,
        inspectionId: inspection.id,
        amount: Number.parseInt(process.env.REPORT_PRICE_IDR || "29000", 10),
        status: "paid",
        provider: "mock",
        providerRef: "MOCK-SEED",
        paidAt: new Date(),
      },
    });

    console.log(`Inspeksi demo: /inspeksi/${inspection.id}/hasil`);
    console.log(`Share link demo: /laporan/${inspection.shareToken}`);
  }

  console.log(`Admin : ${admin.email} / ${KATA_SANDI}`);
  console.log(`Demo  : ${demo.email} / ${KATA_SANDI}`);
  console.log(`Template: ${template.key} v${template.version} (Tier B: ${template.tierBStatus})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
