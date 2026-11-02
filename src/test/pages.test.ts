import { metaFor } from '../lib/pages';

describe('metaFor', () => {
  it('finds a page with or without a trailing slash', () => {
    expect(metaFor('/about/').title).toBe(metaFor('/about').title);
    expect(metaFor('/about/').title).not.toBe(metaFor('/404').title);
  });

  it('keeps the homepage and unknown pages as they were', () => {
    expect(metaFor('/').title).not.toBe(metaFor('/404').title);
    expect(metaFor('/nope/').title).toBe(metaFor('/404').title);
  });
});
