import { useEffect, useRef, useState } from 'react';
import { maybe, t } from '../content';

interface ShotProps {
  /** Alt-text key in images copy (e.g. "img.v01"). The image renders only once that alt text is approved. */
  altKey: string;
  /** Path without the "-{width}.jpg" suffix, e.g. "/images/qk/v01-search". */
  base: string;
  widths: number[];
  /** Intrinsic size of the largest file, so the layout doesn't jump while it loads. */
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  eager?: boolean;
  /**
   * Open the full-size image in an in-page viewer, for screenshots too small to read in place.
   * It's a real link to the file, so it still works before the page's script loads.
   */
  enlarge?: boolean;
}

export function Shot({ altKey, base, widths, width, height, sizes = '(min-width: 860px) 640px, 100vw', className, eager, enlarge }: ShotProps) {
  const alt = altKey.startsWith('btb:') ? maybe('btb', altKey.slice(4)) : maybe('images', altKey);
  if (!alt) return null;
  const largest = Math.max(...widths);
  const img = (
    <img
      className={`shot-img${className ? ` ${className}` : ''}`}
      src={`${base}-${largest}.jpg`}
      srcSet={widths.map((w) => `${base}-${w}.jpg ${w}w`).join(', ')}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
  if (!enlarge) return img;
  return <Enlargeable href={`${base}-${largest}.jpg`} alt={alt} width={width} height={height}>{img}</Enlargeable>;
}

function Enlargeable({ href, alt, width, height, children }: { href: string; alt: string; width: number; height: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const close = () => {
    setOpen(false);
    // Focus goes back to the thumbnail that opened the viewer.
    requestAnimationFrame(() => linkRef.current?.focus());
  };
  return (
    <>
      {/* The link's accessible name is the image's alt text; the ⤢ corner mark is decorative. */}
      <a
        ref={linkRef}
        href={href}
        className="shot-link"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>
      {open && <Lightbox src={href} alt={alt} width={width} height={height} onClose={close} />}
    </>
  );
}

function Lightbox({ src, alt, width, height, onClose }: { src: string; alt: string; width: number; height: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={alt}
      // Esc fires `cancel`; close through the same path so focus returns to the thumbnail.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="lightbox-head">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} autoFocus>
          {t('global', 'jump.close.phone')}
        </button>
      </div>
      <figure className="lightbox-figure">
        <img src={src} alt={alt} width={width} height={height} />
        <figcaption>{alt}</figcaption>
      </figure>
    </dialog>
  );
}
