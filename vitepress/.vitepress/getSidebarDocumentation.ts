import type { DefaultTheme } from 'vitepress';

const languages = ['ru', 'en'] as const;

export type TypeLanguage = (typeof languages)[number];

export type TypeLocalization = Record<string, Record<TypeLanguage, string>>;

export function getSidebarDocumentation(ln: TypeLocalization) {
  const result: Record<TypeLanguage, DefaultTheme.SidebarMulti> & {
    defaultLink: Record<TypeLanguage, string>;
  } = {
    ru: {},
    en: {},
    defaultLink: { ru: '', en: '' },
  };

  for (const lang of languages) {
    result.defaultLink[lang] = `/${lang}/introduction/overview`;

    const sidebar: Array<DefaultTheme.SidebarItem> = [
      {
        items: [
          { text: ln.overview[lang], link: result.defaultLink[lang] },
          { text: ln.philosophy[lang], link: `/${lang}/introduction/philosophy` },
          { text: ln.setup[lang], link: `/${lang}/introduction/first-setup` },
          { text: ln.concepts[lang], link: `/${lang}/introduction/core-concepts` },
          { text: ln.limitations[lang], link: `/${lang}/introduction/limitations` },
          { text: ln.comparison[lang], link: `/${lang}/introduction/comparison` },
        ],
      },
      {
        text: ln.api[lang],
        items: [
          { text: ln.config[lang], link: `/${lang}/api/config` },
          { text: ln.state[lang], link: `/${lang}/api/state` },
          { text: ln.router[lang], link: `/${lang}/api/router` },
        ],
      },
      {
        text: ln.usage[lang],
        items: [
          { text: ln.link[lang], link: `/${lang}/usage/link` },
          { text: ln.dynamicComponents[lang], link: `/${lang}/usage/dynamic-components` },
          { text: ln.ssr[lang], link: `/${lang}/usage/ssr` },
          { text: ln.redirectsChain[lang], link: `/${lang}/usage/redirects-chain` },
        ],
      },
      {
        text: ln.integrations[lang],
        items: [
          { text: 'React', link: `/${lang}/integration/react` },
          { text: 'Preact', link: `/${lang}/integration/preact` },
          { text: 'Solid.js', link: `/${lang}/integration/solid` },
          { text: 'Vue', link: `/${lang}/integration/vue` },
        ],
      },
    ];

    for (const item of sidebar) {
      item.items?.forEach(({ link }) => {
        const sectionPath = link!.split('/').slice(0, 3).join('/');

        if (!result[lang][sectionPath]) {
          result[lang][sectionPath] = sidebar;
        }
      });
    }
  }

  return result;
}
