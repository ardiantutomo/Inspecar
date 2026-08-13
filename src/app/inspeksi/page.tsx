import { Suspense } from "react";
import { InspectionPageClient } from "./InspectionPageClient";

export default function InspeksiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-surface text-ink/60">
          Memuat checklist...
        </div>
      }
    >
      <InspectionPageClient />
    </Suspense>
  );
}
