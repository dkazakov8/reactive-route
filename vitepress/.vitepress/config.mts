import { defineConfig } from 'vitepress';
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
  localIconLoader,
} from 'vitepress-plugin-group-icons';

import { labelsPlugin } from './theme/labelsPlugin.js';

export default defineConfig({
  title: 'Reactive Route',
  description: 'Config-based routing for different frameworks',
  base: '/reactive-route/',
  head: [['link', { rel: 'icon', href: '/reactive-route/file.svg' }]],
  appearance: 'force-dark',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { component: 'FrameworkSelect' },
          { text: 'Home', link: '/' },
          { text: 'Documentation', link: '/guide/', activeMatch: '/guide/' },
          { text: 'Examples', link: '/examples/react', activeMatch: '/examples/' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Why Reactive Route?', link: '/guide/' },
                { text: 'Getting Started', link: '/guide/getting-started' },
                { text: 'Core Concepts', link: '/guide/core-concepts' },
                { text: 'Limitations', link: '/guide/limitations' },
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'Config', link: '/guide/config' },
                { text: 'State', link: '/guide/state' },
                { text: 'Router API', link: '/guide/router-api' },
                { text: 'SSR', link: '/guide/ssr' },
                { text: 'Use Cases', link: '/guide/advanced' },
              ],
            },
            {
              text: 'Framework Integration',
              items: [
                { text: 'React', link: '/guide/react' },
                { text: 'Preact', link: '/guide/preact' },
                { text: 'Solid.js', link: '/guide/solid' },
                { text: 'Vue', link: '/guide/vue' },
              ],
            },
          ],
          '/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'React', link: '/examples/react' },
                { text: 'Preact', link: '/examples/preact' },
                { text: 'Solid.js', link: '/examples/solid' },
                { text: 'Vue', link: '/examples/vue' },
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
      md.use(groupIconMdPlugin);
      // @ts-ignore
      labelsPlugin(md);
    },
  },
  vite: {
    plugins: [
      // https://icon-sets.iconify.design/
      // @ts-ignore
      groupIconVitePlugin({
        customIcon: {
          react: 'logos:react',
          preact: 'logos:preact',
          vue: 'logos:vue',
          solid: 'logos:solidjs-icon',
          'mobx-router': 'vscode-icons:file-type-reactjs',
          'vue-router': 'vscode-icons:file-type-vue',
          'react-router': 'logos:react-router',
          '@tanstack/react-router': 'logos:react',
          '@kitbag/router': 'vscode-icons:file-type-vue',
          'reactive-route': localIconLoader(import.meta.url, '../public/file.svg'),
        },
      }),
    ],
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
