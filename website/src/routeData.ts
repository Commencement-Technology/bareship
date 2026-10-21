// Share-preview tags for each page (Starlight route middleware). Every preview title names Bareship
// ("Offline – Bareship"; the home page "Bareship – …"), and the home page is a website while docs pages stay
// articles. Pages listed in og-pages.json share their own image (scripts/og-image.mjs); the rest share og.png.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import ogPages from './og-pages.json';
import { site } from './seo';

type HeadEntry = {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  content?: string;
};

const homeTitle = 'Bareship – offline-first React Native template';

export const onRequest = defineRouteMiddleware(context => {
  const route = context.locals.starlightRoute;
  const id = route.entry.id;
  const isHome = id === 'index' || id === '';
  const head = route.head as HeadEntry[];

  const set = (key: 'property' | 'name', name: string, content: string) => {
    const tag = head.find(entry => entry.tag === 'meta' && entry.attrs?.[key] === name);
    if (tag?.attrs) tag.attrs.content = content;
    else head.push({ tag: 'meta', attrs: { [key]: name, content } });
  };

  const image = ogPages.includes(id) ? `${site}/og/${id}.png` : `${site}/og.png`;
  set('property', 'og:image', image);
  set('property', 'og:image:width', '1200');
  set('property', 'og:image:height', '630');
  set(
    'property',
    'og:image:alt',
    `${route.entry.data.title} – Bareship, an offline-first React Native template`,
  );
  set('name', 'twitter:image', image);
  set('property', 'og:title', `${route.entry.data.title} – Bareship`);

  if (isHome) {
    set('property', 'og:title', homeTitle);
    set('property', 'og:type', 'website');
    set('property', 'og:image:alt', homeTitle);
  }
});
