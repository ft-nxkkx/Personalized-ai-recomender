/**
 * A pull quote set in the margin, in an italic serif so it reads like a clipping, not like UI.
 * Hidden on small screens, where there is no margin to put it in.
 */
export function PullQuote({ children, by, className = '' }: { children: React.ReactNode; by: string; className?: string }) {
  return (
    <figure className={`pointer-events-none hidden max-w-[22ch] lg:block ${className}`}>
      <blockquote className="quote relative text-[26px] leading-[1.1] text-ink">
        <span className="quote absolute -left-[0.55em] -top-[0.25em] text-[2.2em] leading-none text-accent-2" aria-hidden>
          &ldquo;
        </span>
        {children}
      </blockquote>
      <figcaption className="label mt-2 text-muted">{by}</figcaption>
    </figure>
  );
}
