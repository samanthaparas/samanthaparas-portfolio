// Launch conditions from IMPLEMENTATION-MAP.md. Each flag turns a page, nav item or route stop on
// only once the real thing exists. Nothing renders as a placeholder.
export const launch = {
  labHasEntries: false,
  resumePdf: false,
  easterEggsPage: false,
  conceptStudy: false,
  portfolioRepo: false,
} as const;

export const external = {
  questkeeperLive: 'https://questkeeper-it0i.onrender.com',
  questkeeperRepo: 'https://github.com/samanthaparas/QuestKeeper',
  questkeeperReadme: 'https://github.com/samanthaparas/QuestKeeper#readme',
  github: 'https://github.com/samanthaparas',
  linkedin: 'https://www.linkedin.com/in/samantha-paras/',
  email: 'samantha.paras94@gmail.com',
  tripletenCertificate: 'https://drive.google.com/file/d/1EFWZK81K-YYzIHseD916oJo19uYNXrfu/view',
} as const;

// The domain isn't decided yet. Canonical and absolute Open Graph URLs render only once this is set.
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? '';
