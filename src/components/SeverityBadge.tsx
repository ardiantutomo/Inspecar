import { Severity } from "@/types/checklist";

export function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === "major") {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-critical bg-critical/10">
        Major
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-caution bg-caution/10">
      Minor
    </span>
  );
}
