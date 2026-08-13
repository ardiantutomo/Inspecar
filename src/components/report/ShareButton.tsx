"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ShareButton({ inspectionId, existingToken }: { inspectionId: string; existingToken?: string | null }) {
  const [link, setLink] = useState<string | null>(
    existingToken && typeof window !== "undefined" ? `${window.location.origin}/laporan/${existingToken}` : null
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/inspeksi/${inspectionId}/share`, { method: "POST" });
      const data = await res.json();
      setLink(`${window.location.origin}/laporan/${data.shareToken}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (link) {
    return (
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          className="font-data tap-target w-full max-w-xs truncate rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-xs text-[var(--ink)]"
        />
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Tersalin" : "Salin"}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={handleShare} disabled={loading}>
      <Share2 className="h-4 w-4" />
      {loading ? "Membuat link…" : "Bagikan hasil"}
    </Button>
  );
}
