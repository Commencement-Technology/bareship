// Website and docs for rn-template. Astro Starlight. Pages come from the repo's docs/ and from content/
// (scripts/sync-docs.mjs writes them into src/content/docs/), so the docs are written once.
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [
    starlight({
      title: 'rn-template',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        alt: 'rn-template logo',
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/theme.css'],
      description:
        'A production-ready bare React Native template: offline-first, secure, and built for AI agents.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/psingh2907/rn-template-bare' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            'start-here/introduction',
            'start-here/quick-start',
            'start-here/environments',
            'start-here/faq',
          ],
        },
        {
          label: 'Build your app',
          items: [
            'build/architecture',
            'build/offline',
            'build/generators',
            'build/ai-agents',
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
