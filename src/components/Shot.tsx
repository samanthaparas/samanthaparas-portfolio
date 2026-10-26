import { maybe } from '../content';

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
  /** Wrap the image in a link to the full-size file (same tab), for screenshots too small to read in place. */
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
  // The link's accessible name is the image's alt text; the ⤢ corner mark is decorative.
  return (
    <a href={`${base}-${largest}.jpg`} className="shot-link">
      {img}
    </a>
  );
}
