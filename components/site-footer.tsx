export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-8 text-sm text-muted-foreground">
        <p>
          We show renewal prices because cheap first-year domains can get
          expensive later.
        </p>
        <p>
          Prices from the Porkbun public pricing API. Availability via RDAP.
          Cached briefly so we don&apos;t spam them. Always check the registrar
          before buying.
        </p>
      </div>
    </footer>
  )
}
