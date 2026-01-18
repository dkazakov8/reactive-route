import { defineConfig } from 'vitepress';
// @ts-ignore
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

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
                { text: 'Настройка', link: '/ru/guide/getting-started' },
                { text: 'Основные структуры', link: '/ru/guide/core-concepts' },
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
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
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
