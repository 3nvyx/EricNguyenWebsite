/** The page's title at the top of the right column, at the reference's brand-title size. */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="fw-name mb-[calc(36*var(--u))]">{children}</h1>;
}
