// Website and docs for rn-template. Astro Starlight. Pages come from the repo's docs/ and from content/
// (scripts/sync-docs.mjs writes them into src/content/docs/), so the docs are written once.
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
          items: ['start-here/introduction', 'start-here/environments'],
        },
        {
          label: 'Build your app',
          items: [
            'build/architecture',
            'build/generators',
            'build/styling',
            'build/testing',
            'build/project-rules',
          ],
        },
        {
          label: 'Production',
          items: [
            'production/going-live',
            'production/releasing',
            'production/demo-build',
            'production/native-changes',
          ],
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Decisions',
              collapsed: true,
              items: [{ autogenerate: { directory: 'reference/decisions' } }],
            },
            'reference/version-matrix',
            'reference/best-practices-audit',
            'reference/contributing',
            'reference/changelog',
          ],
        },
      ],
    }),
  ],
});
