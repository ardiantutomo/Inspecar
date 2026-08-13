import { type Verdict, VERDICT_LABEL, VERDICT_RINGKAS } from "@/lib/scoring/score";

/**
 * Signature element (docs/prompt-desain-ui-anti-slop.md): hasil putusan
 * ditampilkan seperti stempel hasil inspeksi resmi. Semua elemen lain di app
 * dibuat tenang supaya kartu ini yang diingat. Tanda sudut hanya ada di sini.
 */

const TONE: Record<Verdict, { text: string; border: string }> = {
  layak: { text: "text-clear", border: "border-clear" },
  hati_hati: { text: "text-caution", border: "border-caution" },
  hindari: { text: "text-critical", border: "border-critical" },
  belum_lengkap: { text: "text-ink-soft", border: "border-line-strong" },
};

function CornerMarks() {
  const shared = "pointer-events-none absolute h-3 w-3 border-ink";
  return (
    <>
      <span className={`${shared} left-0 top-0 border-l border-t`} aria-hidden />
      <span className={`${shared} right-0 top-0 border-r border-t`} aria-hidden />
      <span className={`${shared} bottom-0 left-0 border-b border-l`} aria-hidden />
      <span className={`${shared} bottom-0 right-0 border-b border-r`} aria-hidden />
    </>
  );
}

export function VerdictStamp({
  verdict,
  alasan,
  meta,
}: {
  verdict: Verdict;
  alasan: string[];
  meta: { kode: string; versiTemplate: string; waktu: string };
}) {
  const tone = TONE[verdict];

  return (
    <section
      aria-labelledby="verdict-judul"
      className="sheet relative rounded-sheet border border-ink bg-sheet p-1"
    >
      <div className={`relative border ${tone.border} px-5 py-6 sm:px-7 sm:py-8`}>
        <CornerMarks />

        <p className="micro-label">Putusan pemeriksaan</p>

        <h2
          id="verdict-judul"
          className={`mt-3 font-mono text-[26px] font-medium uppercase leading-none tracking-[0.16em] sm:text-[34px] ${tone.text}`}
        >
          {VERDICT_LABEL[verdict]}
        </h2>

        <p className="mt-4 max-w-lg text-[15px] text-ink">
          {VERDICT_RINGKAS[verdict]}
        </p>

        {alasan.length > 0 && (
          <ul className="mt-4 max-w-lg space-y-1.5 text-sm text-ink-soft">
            {alasan.map((baris) => (
              <li key={baris} className="border-l-[3px] border-line pl-3">
                {baris}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1 border-t border-line pt-4 sm:grid-cols-3">
          {[
            ["Kode inspeksi", meta.kode],
            ["Versi checklist", meta.versiTemplate],
            ["Diselesaikan", meta.waktu],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="micro-label">{label}</dt>
              <dd className="data-num text-[13px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
