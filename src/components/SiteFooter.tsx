import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface-raised)] py-8">
      <Container className="flex flex-col gap-2 text-sm text-[var(--ink-soft)]">
        <p>
          Periksa Dulu adalah alat bantu keputusan, bukan jaminan kondisi kendaraan. Untuk keputusan akhir,
          pertimbangkan pemeriksaan oleh bengkel terpercaya.
        </p>
        <p className="font-data text-xs text-[var(--line-strong)]">© {new Date().getFullYear()} Periksa Dulu</p>
      </Container>
    </footer>
  );
}
