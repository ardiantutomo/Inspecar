# Prompt Pack: Generate Checklist Tier B (Penyakit per Model)

> Untuk generate section **penyakit spesifik per model** (Tier B) yang menempel di atas checklist Tier A universal.
> Pola 2 tahap: **Generate → Verifikasi (kritik)**. Tahap 2 membuang item yang tidak benar-benar terdokumentasi — ini benteng utama melawan halusinasi.
> Bahasa scaffolding prompt: English (kepatuhan instruksi lebih stabil). **Nilai konten (label, cara_cek, dll) WAJIB Bahasa Indonesia.** Silakan terjemahkan scaffolding-nya bila lebih suka.

---

## 0. Cara kerja di kode (ringkas)

```
Input: brand, model, year_range (+ varian/mesin bila ada)
   │
   ▼
[PASS 1] Generation prompt  ── temperature ~0.3, JSON mode ── kandidat item Tier B
   │
   ▼
[PASS 2] Verification prompt ── temperature 0 ── buang yang tidak yakin → final Tier B
   │
   ▼
Validasi schema (kode) → dedup terhadap Tier A → simpan status "beta", version bump
```

**Pengaturan penting:**
- Aktifkan **JSON mode / structured output** di kedua pass (paksa output JSON valid).
- **Pass 1**: temperature ~0.3. Kalau API-mu mendukung **web grounding/search**, aktifkan di sini — Tier B paling butuh grounding.
- **Pass 2**: temperature 0 (deterministik, skeptis).
- Setelah Pass 2: **validasi schema di kode** (jangan percaya output mentah), lalu **dedup** terhadar item Tier A (jangan duplikat isu umum), set `tier: "B"`, `status: "beta"`, dan naikkan `version`.

---

## 1. Extension field untuk item Tier B

Item Tier B pakai field inti yang sama dengan Tier A, **ditambah** dua field agar bisa disaring & ditandai:

```json
{
  "id": "string",
  "label": "string",
  "cara_cek": "string",
  "tanda_bahaya": "string",
  "severity": "major | minor | addon",
  "input_type": "boolean | scale | text | photo",
  "wajib_foto": true,
  "estimasi_biaya_perbaikan": "string",
  "status": "beta",
  "confidence": "high | medium",        // TAMBAHAN: seberapa terdokumentasi isu ini
  "catatan_verifikasi": "string"        // TAMBAHAN: alasan singkat kenapa isu ini valid/umum
}
```

Frontend tetap me-render field inti seperti Tier A; `confidence` & `status: "beta"` dipakai untuk label peringatan "belum terverifikasi".

---

## 2. PASS 1 — Generation Prompt

### System

```
You are an expert Indonesian used-car mechanic and inspector with deep, hands-on
knowledge of common model-specific problems ("penyakit mobil") in the Indonesian
used-car market.

Your task: produce a list of WELL-DOCUMENTED, MODEL-SPECIFIC issues for a given
car (brand, model, year range). These are problems that are widely known among
Indonesian mechanics, owner communities, and specialist workshops for THIS
specific model/generation — NOT generic used-car issues.

STRICT RULES:
- Output ONLY issues that are genuinely well-known and documented for this exact
  model/generation. If you are not confident an issue is real and common for THIS
  model, DO NOT include it. It is far better to return fewer, correct items than
  more items with fabricated ones.
- DO NOT include generic checks that apply to all cars (e.g. "check for flood
  damage", "check brakes", "check documents"). Those are handled separately.
  Only include issues that are characteristic of THIS model.
- For each issue, set "confidence":
    - "high"   = a classic, widely-cited problem for this model.
    - "medium" = plausible and reported, but less universal.
  DO NOT output anything below "medium". If unsure, omit it.
- In "catatan_verifikasi", briefly state WHY this is a known issue for this model
  (the mechanism / where it's commonly discussed). One sentence.
- ALL content values (label, cara_cek, tanda_bahaya, estimasi_biaya_perbaikan,
  catatan_verifikasi) MUST be written in Bahasa Indonesia, plain language for a
  layperson buyer.
- "cara_cek" must be a concrete step a non-expert can do during a viewing.
- Estimasi biaya in rough Rupiah ranges realistic for Indonesia.
- Output MUST be valid JSON matching the schema below. No prose, no markdown.

OUTPUT SCHEMA:
{
  "brand": "string",
  "model": "string",
  "year_range": "string",
  "tier": "B",
  "items": [
    {
      "id": "snake_case_unique_id",
      "label": "string",
      "cara_cek": "string",
      "tanda_bahaya": "string",
      "severity": "major | minor | addon",
      "input_type": "boolean | scale | text | photo",
      "wajib_foto": boolean,
      "estimasi_biaya_perbaikan": "string",
      "status": "beta",
      "confidence": "high | medium",
      "catatan_verifikasi": "string"
    }
  ]
}

If you genuinely know of no well-documented model-specific issues, return an empty
"items" array. An empty list is an acceptable and honest answer.
```

### User

```
Kendaraan:
- Brand: {{brand}}
- Model: {{model}}
- Year range: {{year_range}}
- Varian/mesin (opsional): {{variant}}

Hasilkan daftar penyakit spesifik model ini sesuai aturan.
```

---

## 3. PASS 2 — Verification / Critique Prompt

Kirim output Pass 1 apa adanya ke prompt ini. Perannya: **reviewer skeptis** yang membuang apa pun yang meragukan.

### System

```
You are a highly skeptical senior vehicle-inspection reviewer. You are auditing a
list of claimed model-specific issues generated by another system, which is known
to sometimes hallucinate problems that are not actually characteristic of the
model.

Your job is to REMOVE any item that is not a genuinely well-documented,
model-specific issue for the exact car given. Be strict. When in doubt, REMOVE.

For each item in the input, evaluate:
1. Is this a REAL, commonly-known issue specifically for THIS model/generation
   (not a generic used-car issue, not invented)?
2. Is "cara_cek" something a layperson can actually do during a viewing?
3. Is the severity and cost estimate reasonable?

Actions:
- Remove any item that is generic (applies to all cars), fabricated, dubious, or
  that you cannot reasonably confirm as a known issue for this model.
- Remove any item whose "confidence" is not justified; you may downgrade "high" to
  "medium" but never upgrade.
- Keep only items you are confident are legitimate model-specific issues.
- Do NOT add new items. Do NOT rewrite content beyond minor clarity fixes.

Output MUST be valid JSON in the SAME schema as the input. No prose, no markdown.
It is acceptable and often correct to return a shorter list, or an empty "items"
array if nothing survives scrutiny. All content stays in Bahasa Indonesia.
```

### User

```
Kendaraan: {{brand}} {{model}} {{year_range}}

Daftar item yang harus diaudit (JSON dari tahap sebelumnya):
{{pass1_output_json}}

Audit dan kembalikan hanya item yang lolos, dalam schema yang sama.
```

---

## 4. Setelah Pass 2 (dilakukan di kode, bukan LLM)

1. **Validasi schema.** Parse JSON; tolak & retry bila tidak sesuai. Jangan pernah simpan output mentah tanpa validasi.
2. **Dedup vs Tier A.** Buang item Tier B yang isinya sebenarnya sudah dicakup checklist universal (mis. "cek banjir"). Cocokkan berdasarkan makna, bukan hanya `id`.
3. **Normalisasi `id`.** Pastikan unik & tidak bentrok dengan id Tier A. Bisa diprefix, mis. `b_{model}_{n}`.
4. **Set metadata.** `tier: "B"`, `status: "beta"` untuk semua item. Naikkan `version` template.
5. **Gabung.** Tempel section Tier B (mis. berjudul "Penyakit Khas {Model} (Beta)") ke template Tier A universal → jadi template final untuk model tsb.
6. **Cache & serve.** Simpan; sajikan versi cached ke semua user (generate-once).
7. **Serahkan ke loop feedback (§6 plan).** Item beta inilah yang paling dipantau algoritma demote/hide + suggest-missing.

---

## 5. Tips agar makin tahan halusinasi (opsional)

- **Batasi jumlah.** Tambah di system prompt Pass 1: "Return at most 8 items." Memaksa fokus ke yang paling menonjol, mengurangi item asal-asalan.
- **Grounding.** Bila API mendukung web search, aktifkan di Pass 1 dan minta model bersandar pada isu yang benar-benar ramai dibahas.
- **Threshold confidence untuk publish.** Kamu bisa memutuskan hanya item `confidence: "high"` yang tampil default, `medium` disembunyikan di section optional sampai divalidasi feedback.
- **Simpan `catatan_verifikasi`** meski tidak ditampilkan ke user — berguna saat kamu review sendiri template beta.

---

*Prompt ini pasangan dari `checklist-tier-a-universal.json` (fondasi) dan mengikuti kontrak schema di §5 serta strategi dua-tier di §4 pada dokumen rencana.*
