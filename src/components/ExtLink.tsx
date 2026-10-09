import type { ReactNode } from 'react';

/**
 * External link. Same tab, no target="_blank" (IMPLEMENTATION-MAP). The ↗ cue is visual only,
 * so it's hidden from screen readers; a trailing ↗ in the copy string is moved into that span.
 */
export function ExtLink({ href, children, className }: { href: string; children: string | ReactNode; className?: string }) {
  const text = typeof children === 'string' ? children.replace(/\s*↗\s*$/, '') : children;
  return (
    <a href={href} className={className}>
      {text}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}
