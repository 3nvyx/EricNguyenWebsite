import { cn } from "@/lib/utils";

/** The page's title at the top of its column, at the reference's brand-title size. */
export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn("fw-name mb-[calc(36*var(--u))]", className)}>{children}</h1>;
}
