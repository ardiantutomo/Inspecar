import { Link } from 'react-router-dom'

export function TopBar({
  title,
  backTo,
  right,
}: {
  title: string
  backTo?: string
  right?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-xl items-center gap-2 px-4">
        {backTo && (
          <Link
            to={backTo}
            aria-label="Kembali"
            className="-ml-2 flex size-9 items-center justify-center rounded-sm text-ink-soft"
          >
            <span aria-hidden className="text-lg">
              ‹
            </span>
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</h1>
        {right}
      </div>
    </header>
  )
}
