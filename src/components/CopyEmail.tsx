import { useEffect, useState } from 'react';
import { t } from '../content';
import { external } from '../lib/site';

/** Copies the address without navigating. Shows "Copied" for 2s; screen readers hear the announcement. */
export function CopyEmail({ labelKey = 'footer.copy' }: { labelKey?: 'footer.copy' | 'contact.copyEmail' }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(external.email);
            setCopied(true);
          } catch {
            /* clipboard blocked: the address is visible next to the button */
          }
        }}
      >
        {copied ? t('global', 'footer.copied') : t('global', labelKey)}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? t('global', 'footer.copied.announce') : ''}
      </span>
    </>
  );
}
