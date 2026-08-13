import { useRef, useState } from 'react'
import { compressImage } from '../lib/photo'

export function PhotoInput({
  photos,
  required,
  onChange,
}: {
  photos: string[]
  required: boolean
  onChange: (photos: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    try {
      const compressed = await Promise.all([...files].map(compressImage))
      onChange([...photos, ...compressed].slice(0, 4))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Foto {required ? '· wajib' : '· opsional'}
        </span>
        {required && photos.length === 0 && (
          <span className="size-1.5 rounded-full bg-critical" aria-hidden />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative">
            <img
              src={src}
              alt={`Foto ${i + 1}`}
              className="size-16 rounded-sm border border-line object-cover"
            />
            <button
              type="button"
              aria-label={`Hapus foto ${i + 1}`}
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-line bg-card text-xs leading-none text-ink-soft"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < 4 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex size-16 flex-col items-center justify-center gap-0.5 rounded-sm border border-dashed border-line bg-surface text-ink-soft active:bg-line-soft disabled:opacity-50"
          >
            <span className="text-lg leading-none" aria-hidden>
              +
            </span>
            <span className="text-[10px]">{busy ? '...' : 'Foto'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
