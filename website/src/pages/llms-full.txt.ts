// Every docs page in full, as one Markdown file, for AI tools that read a whole site at once.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { pageUrl } from './llms.txt';

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));
  const text = docs
    .filter(d => d.id !== 'index')
    .map(d => `# ${d.data.title}\n\nSource: ${pageUrl(d.id)}\n\n${(d.body ?? '').trim()}\n`)
    .join('\n---\n\n');
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
