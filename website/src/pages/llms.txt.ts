// A plain-Markdown index of the site for AI tools (the llms.txt proposal, llmstxt.org), built from the docs
// collection so it lists exactly the published pages. /llms-full.txt has every page in full.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../seo';

const sections: Record<string, string> = {
  'start-here': 'Start here',
  build: 'Build your app',
  production: 'Production',
  reference: 'Reference',
};

export const pageUrl = (id: string) => (id === 'index' ? `${site}/` : `${site}/${id}/`);

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));
  const text = [
    '# Bareship',
    '',
    '> Bareship is a production-ready, offline-first bare React Native template for teams and AI agents. Free under the MIT license.',
    '',
    '- npm: https://www.npmjs.com/package/bareship',
    '- GitHub: https://github.com/psingh2907/bareship',
    '- Maintainer: Praveen Singh, https://www.praveensingh.co.in',
    `- Every page in full: ${site}/llms-full.txt`,
    '',
    ...Object.entries(sections).flatMap(([dir, label]) => [
      `## ${label}`,
      '',
      ...docs
        .filter(d => d.id.startsWith(`${dir}/`))
        .map(
          d =>
            `- [${d.data.title}](${pageUrl(d.id)})${d.data.description ? `: ${d.data.description}` : ''}`,
        ),
      '',
    ]),
  ].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
