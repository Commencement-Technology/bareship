// Website and docs for rn-template. Astro Starlight; content comes from the repo's docs/ (see
// scripts/sync-docs.ts), so the docs are written once.
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [
    starlight({
      title: 'rn-template',
      description:
        'A production-ready bare React Native template: offline-first, secure, and built for AI agents.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/psingh2907/rn-template-bare' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [{ label: 'Introduction', slug: 'introduction' }],
        },
      ],
    }),
  ],
});
