import { ButtonLink } from "@/components/ui/button";
import { Page, PageHeading } from "@/components/ui/sheet";

export default function TidakDitemukan() {
  return (
    <Page width="narrow">
      <PageHeading
        eyebrow="404"
        title="Halaman ini tidak ada"
        lead="Kemungkinan link-nya sudah kedaluwarsa, atau inspeksinya milik akun lain."
      />
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/inspeksi">Ke inspeksi saya</ButtonLink>
        <ButtonLink href="/" variant="garis">
          Ke halaman depan
        </ButtonLink>
      </div>
    </Page>
  );
}
