import path from 'node:path';

import { type DefaultTheme, defineConfig } from 'vitepress';

import { getSidebarDocumentation } from './getSidebarDocumentation.js';
import { labelsPlugin } from './theme/labelsPlugin.js';

const sidebarConfig = getSidebarDocumentation({
  overview: {
    ru: 'Обзор и назначение',
    en: 'Overview',
  },
  setup: {
    ru: 'Установка и настройка',
    en: 'Getting Started',
  },
  concepts: {
    ru: 'Принцип работы',
    en: 'How it works',
  },
  limitations: {
    ru: 'Ограничения',
    en: 'Limitations',
  },
  comparison: {
    ru: 'Сравнение',
    en: 'Comparison',
  },

  api: {
    ru: 'API',
    en: 'API',
  },
  config: {
    ru: 'Config',
    en: 'Config',
  },
  state: {
    ru: 'State',
    en: 'State',
  },
  router: {
    ru: 'Router',
    en: 'Router API',
  },

  usage: {
    ru: 'Использование',
    en: 'Usage',
  },
  link: {
    ru: 'Link',
    en: 'Link',
  },
  dynamicComponents: {
    ru: 'Динамические компоненты / Layout',
    en: 'Dynamic components / Layout',
  },
  ssr: {
    ru: 'SSR',
    en: 'SSR',
  },
  redirectsChain: {
    ru: 'Цепочки редиректов',
    en: 'Redirects chain',
  },

  integrations: {
    ru: 'Интеграции',
    en: 'Framework Integration',
  },
});

export default defineConfig({
  outDir: path.resolve(__dirname, '../../docs'),
  vite: {
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '..') },
        { find: '@shared', replacement: path.resolve(__dirname, '../shared') },
        { find: '@scripts', replacement: path.resolve(__dirname, '../../scripts') },
      ],
    },
  },
  title: 'Reactive Route',
  description: 'Config-based routing for different frameworks',
  base: '/reactive-route/',
  head: [['link', { rel: 'icon', href: '/reactive-route/file.svg' }]] as Array<
    [string, Record<string, string>]
  >,
  appearance: 'force-dark',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { component: 'FrameworkSelect' },
          { text: 'Home', link: '/en/' },
          {
            text: 'Documentation',
            link: sidebarConfig.defaultLink.en,
            activeMatch: `(${Array.from(Object.keys(sidebarConfig.en)).join('|')})`,
          },
          { text: 'Examples', link: '/en/examples/react', activeMatch: '/en/examples/' },
        ],
        sidebar: {
          ...sidebarConfig.en,
          '/en/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'React', link: '/en/examples/react' },
                { text: 'Preact', link: '/en/examples/preact' },
                { text: 'Solid.js', link: '/en/examples/solid' },
                { text: 'Vue', link: '/en/examples/vue' },
              ],
            },
          ],
        },
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      themeConfig: {
        outlineTitle: 'На этой странице',
        nav: [
          { component: 'FrameworkSelect' },
          { text: 'Главная', link: '/ru/' },
          {
            text: 'Документация',
            link: sidebarConfig.defaultLink.ru,
            activeMatch: `(${Array.from(Object.keys(sidebarConfig.ru)).join('|')})`,
          },
          { text: 'Примеры', link: '/ru/examples/react', activeMatch: '/ru/examples/' },
        ],
        sidebar: {
          ...sidebarConfig.ru,
          '/ru/examples/': [
            {
              text: 'Примеры',
              items: [
                { text: 'React', link: '/ru/examples/react' },
                { text: 'Preact', link: '/ru/examples/preact' },
                { text: 'Solid.js', link: '/ru/examples/solid' },
                { text: 'Vue', link: '/ru/examples/vue' },
              ],
            },
          ],
        },
      },
    },
  },
  markdown: {
    config(md) {
      labelsPlugin(md as any);
    },
    theme: { dark: 'github-dark', light: 'github-light' },
    codeCopyButtonTitle: 'Copy code',
  },
  themeConfig: {
    logo: '/file.svg',
    search: {
      provider: 'local',
      options: {
        locales: {
          ru: {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск',
              },
              modal: {
                displayDetails: 'Отобразить подробный список',
                resetButtonTitle: 'Сбросить поиск',
                backButtonTitle: 'Закрыть поиск',
                noResultsText: 'Нет результатов по запросу',
                footer: {
                  selectText: 'выбрать',
                  selectKeyAriaLabel: 'выбрать',
                  navigateText: 'перейти',
                  navigateUpKeyAriaLabel: 'стрелка вверх',
                  navigateDownKeyAriaLabel: 'стрелка вниз',
                  closeText: 'закрыть',
                  closeKeyAriaLabel: 'esc',
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dkazakov8/reactive-route' },
    ] as Array<DefaultTheme.SocialLink>,
    footer: {
      message: 'Released under the MIT License',
    },
  },
});
