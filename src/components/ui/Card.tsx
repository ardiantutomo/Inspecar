import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)] p-6", className)}>
      {children}
    </div>
  );
}
