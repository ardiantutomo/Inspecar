"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function PhotoUpload({
  value,
  onChange,
  required,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal mengunggah foto");
      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch {
      setError("Gagal mengunggah foto. Coba lagi atau lanjut tanpa foto.");
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="relative inline-block">
        <Image
          src={value}
          alt="Foto bukti temuan"
          width={112}
          height={112}
          className="h-28 w-28 rounded-[var(--radius-sm)] border border-[var(--line)] object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="Hapus foto"
          className="tap-target absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "tap-target inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-dashed px-3 text-sm font-medium",
          required ? "border-[var(--critical)] text-[var(--critical)]" : "border-[var(--line-strong)] text-[var(--ink-soft)]"
        )}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {uploading ? "Mengunggah…" : required ? "Wajib foto" : "Tambah foto (opsional)"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="mt-1 text-xs text-[var(--critical)]">{error}</p>}
    </div>
  );
}
