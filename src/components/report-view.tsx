import { DataRow, MicroLabel, Sheet } from "@/components/ui/sheet";
import {
  RESULT_BORDER,
  RESULT_TEXT,
  Tally,
  WEIGHT_LABEL,
  WEIGHT_TEXT,
} from "@/components/ui/severity";
import { VerdictStamp } from "@/components/verdict-stamp";
import { RESULT_LABEL, type Result } from "@/lib/checklist/answers";
import { visibleItems } from "@/lib/checklist/schema";
import { formatInspectionCode, formatTanggal, type ReportData } from "@/lib/report";
import { formatKm, formatRentang, formatRupiah } from "@/lib/scoring/rupiah";

/**
 * Isi report. Dipakai oleh halaman pemilik dan halaman share publik dengan
 * data yang sama, supaya orang yang menerima link melihat persis apa yang
 * dilihat pembeli.
 */
export function ReportView({
  data,
  terbuka,
  shareToken,
}: {
  data: ReportData;
  /** Bagian berbayar (putusan, biaya, narasi, bahan nego) ditampilkan penuh. */
  terbuka: boolean;
  shareToken?: string;
}) {
  const { inspection, vehicle, score, template } = data;
  const kendaraan = `${vehicle.brand} ${vehicle.model}`;
  const suffixFoto = shareToken ? `?t=${shareToken}` : "";

  return (
    <div className="space-y-8">
      <Sheet className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
          <div>
            <MicroLabel>Lembar hasil inspeksi</MicroLabel>
            <h1 className="mt-1 text-2xl font-semibold">{kendaraan}</h1>
          </div>
          <span className="data-num text-sm text-ink-soft">
            {formatInspectionCode(inspection.id)}
          </span>
        </div>

        <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
          <div>
            <DataRow label="Tahun / generasi" value={vehicle.yearRange} />
            <DataRow label="Tahun unit" value={vehicle.year ?? "—"} />
            <DataRow
              label="Transmisi"
              value={vehicle.transmission ?? "—"}
              mono={false}
            />
            <DataRow label="Varian" value={vehicle.variant ?? "—"} mono={false} />
          </div>
          <div>
            <DataRow label="Plat" value={vehicle.plateNo ?? "—"} />
            <DataRow
              label="Odometer"
              value={inspection.odometerKm ? formatKm(inspection.odometerKm) : "—"}
            />
            <DataRow
              label="Harga diminta"
              value={
                inspection.askingPrice ? formatRupiah(inspection.askingPrice) : "—"
              }
            />
            <DataRow
              label="Diperiksa"
              value={formatTanggal(inspection.completedAt ?? inspection.startedAt)}
            />
          </div>
        </div>
      </Sheet>

      {terbuka ? (
        <VerdictStamp
          verdict={score.verdict}
          alasan={score.alasan}
          meta={{
            kode: formatInspectionCode(inspection.id),
            versiTemplate: `v${inspection.templateVersion}`,
            waktu: formatTanggal(inspection.completedAt ?? inspection.startedAt),
          }}
        />
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Hitungan temuan</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Tally value={score.counts.kritis} label="Berat" tone="text-critical" />
          <Tally
            value={score.counts.perhatian}
            label="Perlu perhatian"
            tone="text-caution"
          />
          <Tally value={score.counts.ringan} label="Ringan" />
          <Tally value={score.counts.aman} label="Aman" tone="text-clear" />
          <Tally value={score.counts.tidakDicek} label="Belum dicek" />
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          {score.kelengkapan.dijawab} dari {score.kelengkapan.total} pemeriksaan
          terisi ({score.kelengkapan.persen}%). Pemeriksaan penting:{" "}
          {score.kelengkapan.majorDijawab}/{score.kelengkapan.majorTotal}.
        </p>
      </section>

      {terbuka && (
        <section>
          <h2 className="text-lg font-semibold">Ringkasan & rekomendasi</h2>
          <Sheet className="mt-3 p-4 sm:p-5">
            <div className="space-y-3 text-[15px] leading-relaxed">
              {data.narrative.split("\n\n").map((paragraf) => (
                <p key={paragraf.slice(0, 24)}>{paragraf}</p>
              ))}
            </div>
            <p className="micro-label mt-4 block border-t border-line pt-3">
              Disusun {data.narrativeEngine === "llm" ? "dengan bantuan AI" : "otomatis"}{" "}
              dari hasil checklist · putusan dihitung sistem, bukan AI
            </p>
          </Sheet>
        </section>
      )}

      {terbuka && (
        <section>
          <h2 className="text-lg font-semibold">Perkiraan biaya perbaikan</h2>
          <Sheet className="mt-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
              <MicroLabel>Total temuan yang terukur</MicroLabel>
              <span className="data-num text-xl">
                {formatRentang(score.biaya.min, score.biaya.max, score.biaya.unbounded)}
              </span>
            </div>

            {score.biaya.takTerukur > 0 && (
              <p className="mt-3 text-sm text-ink-soft">
                {score.biaya.takTerukur} temuan tidak bisa diangkakan sebelum
                dibongkar bengkel, jadi tidak masuk total di atas.
              </p>
            )}

            {inspection.askingPrice && score.biaya.max > 0 && (
              <p className="mt-3 text-sm">
                Dengan harga yang diminta {formatRupiah(inspection.askingPrice)},
                biaya di atas setara{" "}
                <span className="data-num">
                  {Math.round((score.biaya.max / inspection.askingPrice) * 100)}%
                </span>{" "}
                dari harga unit pada perkiraan tertinggi.
              </p>
            )}

            {score.nego.length > 0 && (
              <div className="mt-5">
                <MicroLabel className="block">Bahan menawar</MicroLabel>
                <ul className="mt-2">
                  {score.nego.map((finding) => (
                    <li
                      key={finding.itemId}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-2 last:border-b-0"
                    >
                      <span className="text-sm">{finding.label}</span>
                      <span className="data-num text-sm text-ink-soft">
                        {formatRentang(finding.biayaMin, finding.biayaMax, finding.biaya.unbounded)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Sheet>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">Temuan</h2>
        {score.findings.length === 0 ? (
          <Sheet className="mt-3 p-4">
            <p className="text-sm text-ink-soft">
              Tidak ada temuan yang tercatat dari pemeriksaan yang sudah diisi.
            </p>
          </Sheet>
        ) : (
          <ul className="mt-3 grid gap-2">
            {score.findings.map((finding) => (
              <Sheet as="li" key={finding.itemId} className="p-0">
                <div className={`border-l-[3px] p-4 ${RESULT_BORDER[finding.result]}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[16px] font-semibold">
                      {finding.label}
                    </h3>
                    <span className={`micro-label ${WEIGHT_TEXT[finding.weight]}`}>
                      {WEIGHT_LABEL[finding.weight]}
                      {finding.dealBreaker ? " · pembatal" : ""}
                    </span>
                  </div>
                  <p className="micro-label mt-1 block">{finding.sectionTitle}</p>
                  <p className="mt-2 text-sm text-ink-soft">{finding.tanda_bahaya}</p>
                  <p className="data-num mt-2 text-sm">{finding.biaya.teks}</p>

                  {(data.photosByItem[finding.itemId]?.length ?? 0) > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {data.photosByItem[finding.itemId].map((photoId) => (
                        <li key={photoId}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/foto/${photoId}${suffixFoto}`}
                            alt={`Foto ${finding.label}`}
                            className="h-24 w-24 rounded-sheet border border-line object-cover"
                            loading="lazy"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Sheet>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Seluruh pemeriksaan</h2>
        <div className="mt-3 space-y-5">
          {template.sections.map((section) => {
            const items = visibleItems(section, vehicle.transmission);
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-[15px] font-semibold">
                    {section.title}
                  </h3>
                  <MicroLabel>
                    {section.severity === "major" ? "Penting" : "Sekunder"}
                    {section.beta ? " · beta" : ""}
                  </MicroLabel>
                </div>
                <ul className="mt-1">
                  {items.map((item) => {
                    const answer = data.answersByItem[item.id];
                    const result = (answer?.result ?? "belum") as Result | "belum";
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-2"
                      >
                        <span className="text-sm">
                          {item.label}
                          {answer?.detail ? (
                            <span className="data-num ml-2 text-ink-soft">
                              {answer.detail}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={`micro-label ${
                            result === "belum" ? "" : RESULT_TEXT[result]
                          }`}
                        >
                          {result === "belum" ? "Belum diisi" : RESULT_LABEL[result]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line pt-5">
        <p className="text-sm text-ink-soft">{template.meta.disclaimer}</p>
        <p className="micro-label mt-3 block">
          Checklist {inspection.templateKey} v{inspection.templateVersion} · putusan
          dihitung dari aturan tetap, bukan dari AI
        </p>
      </section>
    </div>
  );
}
