"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { hapusFotoAction } from "@/app/actions/inspeksi";
import { MAX_PHOTOS_PER_ITEM } from "@/lib/photos-limits";

export function UnggahFoto({
  inspectionId,
  itemId,
  photoIds,
  terkunci,
}: {
  inspectionId: string;
  itemId: string;
  photoIds: string[];
  terkunci: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const penuh = photoIds.length >= MAX_PHOTOS_PER_ITEM;

  async function kirim(file: File) {
    setError(null);
    setMengunggah(true);
    try {
      const body = new FormData();
      body.append("itemId", itemId);
      body.append("file", file);

      const response = await fetch(`/api/inspeksi/${inspectionId}/foto`, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Foto gagal diunggah. Coba lagi.");
        return;
      }
      router.refresh();
    } catch {
      setError("Koneksi terputus saat mengunggah. Coba lagi.");
    } finally {
      setMengunggah(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-2">
      {photoIds.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {photoIds.map((photoId) => (
            <li key={photoId} className="relative">
              {/* Foto disajikan lewat route yang memeriksa hak akses, bukan file publik. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/foto/${photoId}`}
                alt="Foto pemeriksaan"
                className="h-20 w-20 rounded-sheet border border-line object-cover"
                loading="lazy"
              />
              {!terkunci && (
                <button
                  type="button"
                  aria-label="Hapus foto"
                  onClick={() =>
                    startTransition(async () => {
                      await hapusFotoAction({ inspectionId, photoId });
                      router.refresh();
                    })
                  }
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-sheet border border-ink bg-sheet text-xs leading-none"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!terkunci && !penuh && (
        <label
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-sheet border border-line-strong px-4 text-sm hover:border-ink ${
            mengunggah ? "opacity-60" : ""
          }`}
        >
          {mengunggah ? "Mengunggah…" : photoIds.length > 0 ? "Tambah foto" : "Ambil foto"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={mengunggah}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void kirim(file);
            }}
          />
        </label>
      )}

      {penuh && !terkunci && (
        <p className="text-xs text-ink-soft">
          Maksimal {MAX_PHOTOS_PER_ITEM} foto. Hapus salah satu untuk menambah.
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
