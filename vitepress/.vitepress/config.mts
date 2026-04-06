import path from 'node:path';

import { type DefaultTheme, defineConfig } from 'vitepress';

import { getSidebarDocumentation } from './getSidebarDocumentation.js';
import { labelsPlugin } from './theme/labelsPlugin.js';
import { tsExpectErrorTransformer } from './theme/tsExpectErrorTransformer.js';
import { wrapTransformer } from './theme/wrapTransformer.js';

const sidebarConfig = getSidebarDocumentation({
  overview: { ru: 'Обзор и назначение', en: 'Overview' },
  setup: { ru: 'Установка и настройка', en: 'Installation and setup' },
  concepts: { ru: 'Принцип работы', en: 'How it works' },
  limitations: { ru: 'Ограничения', en: 'Limitations' },
  comparison: { ru: 'Сравнение', en: 'Comparison' },
  api: { ru: 'API', en: 'API' },

  usage: { ru: 'Использование', en: 'Usage' },
  link: { ru: 'Link', en: 'Link' },
  dynamicComponents: { ru: 'Динамические компоненты', en: 'Dynamic components' },
  ssr: { ru: 'SSR / MPA', en: 'SSR / MPA' },
  redirectsChain: { ru: 'Цепочки редиректов', en: 'Redirects chain' },
  widget: { ru: 'Widget mode', en: 'Widget mode' },

  integrations: { ru: 'Интеграции', en: 'Integration' },
});

export default defineConfig({
  outDir: path.resolve(__dirname, '../../docs'),
  vite: {
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '..') },
        { find: '@shared', replacement: path.resolve(__dirname, '../shared') },
      ],
    },
  },
  title: 'Reactive Route',
  description: 'A reactive, framework-agnostic router in 2 KB',
  base: '/reactive-route/',
  head: [['link', { rel: 'icon', href: '/reactive-route/file.svg' }]],
  appearance: { initialValue: 'dark' },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { component: 'FrameworkSelect' },
          { text: 'Home', link: '/' },
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
    codeTransformers: [tsExpectErrorTransformer, wrapTransformer],
    theme: { dark: 'github-dark', light: 'github-light' },
    codeCopyButtonTitle: 'Copy code',
  },
  themeConfig: {
    logo: '/file.svg',
    outline: {
      level: [2, 3],
    },
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
      message: 'No AI participated in the development. MIT License',
    },
  },
});
