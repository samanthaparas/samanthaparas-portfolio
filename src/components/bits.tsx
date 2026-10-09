import type { ReactNode } from 'react';
import { fill, t } from '../content';

/** A label that starts with "Role: " / "Stack: " etc. is split so the prefix can be styled. */
export function Labeled({ text }: { text: string }) {
  const i = text.indexOf(': ');
  if (i === -1 || i > 14) return <>{text}</>;
  return (
    <>
      <span className="label">{text.slice(0, i)}</span> {text.slice(i + 2)}
    </>
  );
}

/** Status uses shape + text, never color alone (design system §Project spec sheets). */
export function Status({ text }: { text: string }) {
  return <span className="status">{text}</span>;
}

type NoteKind = 'decision' | 'tradeoff' | 'changed' | 'a11y' | 'aside' | 'mistake';

/** Typed margin note. Mistake notes use the friction color; the rest use gold. */
export function MarginNote({ kind, version, label: given, children }: { kind: NoteKind; version?: string; label?: string; children: ReactNode }) {
  const label = given ?? (kind === 'changed' ? fill(t('global', 'note.type.changed'), { version: version ?? '' }) : t('global', `note.type.${kind}`));
  return (
    <aside className={`note note-${kind}`}>
      <span className="note-type">{label}</span>
      <p>{children}</p>
    </aside>
  );
}

/**
 * Origin line. The design system marked these with friction-colored quote marks, but the Phase 4
 * wording rule allows quote marks only on verbatim quotes, so the friction mark is a rule instead.
 */
export function Origin({ text }: { text: string }) {
  return <p className="origin">{text}</p>;
}

export function SectionHeading({ id, children, level = 2 }: { id?: string; children: ReactNode; level?: 2 | 3 }) {
  const Tag = `h${level}` as const;
  return <Tag id={id}>{children}</Tag>;
}
