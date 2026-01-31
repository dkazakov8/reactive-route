import path from 'node:path';

import { defineConfig } from 'vitepress';

import { labelsPlugin } from './theme/labelsPlugin.js';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '..'),
        '@snippets': path.resolve(__dirname, '../snippets'),
        '@scripts': path.resolve(__dirname, '../../scripts'),
      },
    },
  },
  title: 'Reactive Route',
  description: 'Config-based routing for different frameworks',
  base: '/reactive-route/',
  head: [['link', { rel: 'icon', href: '/reactive-route/file.svg' }]],
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
          { text: 'Documentation', link: '/en/guide/', activeMatch: '/en/guide/' },
          { text: 'Examples', link: '/en/examples/react', activeMatch: '/en/examples/' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Why Reactive Route?', link: '/en/guide/' },
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Core Concepts', link: '/en/guide/core-concepts' },
                { text: 'Limitations', link: '/en/guide/limitations' },
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'Config', link: '/en/guide/config' },
                { text: 'State', link: '/en/guide/state' },
                { text: 'Router API', link: '/en/guide/router-api' },
                { text: 'SSR', link: '/en/guide/ssr' },
                { text: 'Use Cases', link: '/en/guide/advanced' },
              ],
            },
            {
              text: 'Framework Integration',
              items: [
                { text: 'React', link: '/en/guide/react' },
                { text: 'Preact', link: '/en/guide/preact' },
                { text: 'Solid.js', link: '/en/guide/solid' },
                { text: 'Vue', link: '/en/guide/vue' },
              ],
            },
          ],
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
        outlineTitle: 'На этой странице:',
        nav: [
          { component: 'FrameworkSelect' },
          { text: 'Главная', link: '/ru/' },
          { text: 'Документация', link: '/ru/guide/', activeMatch: '/ru/guide/' },
          { text: 'Примеры', link: '/ru/examples/react', activeMatch: '/ru/examples/' },
        ],
        sidebar: {
          '/ru/guide/': [
            {
              text: 'Введение',
              items: [
                { text: 'Зачем Reactive Route?', link: '/ru/guide/' },
                { text: 'Пошаговая настройка', link: '/ru/guide/step-by-step' },
                { text: 'Основные структуры', link: '/ru/guide/core-concepts' },
                { text: 'Ограничения', link: '/ru/guide/limitations' },
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'Config', link: '/ru/guide/config' },
                { text: 'State', link: '/ru/guide/state' },
                { text: 'Router API', link: '/ru/guide/router-api' },
                { text: 'SSR', link: '/ru/guide/ssr' },
                { text: 'Use-cases', link: '/ru/guide/advanced' },
              ],
            },
            {
              text: 'Интеграции',
              items: [
                { text: 'React', link: '/ru/guide/react' },
                { text: 'Preact', link: '/ru/guide/preact' },
                { text: 'Solid.js', link: '/ru/guide/solid' },
                { text: 'Vue', link: '/ru/guide/vue' },
              ],
            },
            {
              text: 'Другое',
              items: [{ text: 'Сравнение', link: '/ru/guide/size-compare' }],
            },
          ],
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/dkazakov8/reactive-route' }],
    footer: {
      message: 'Released under the MIT License',
    },
  },
});
