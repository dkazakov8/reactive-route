import { defineConfig } from 'vitepress';
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
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/', activeMatch: '/en/guide/' },
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
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'Config', link: '/en/guide/config' },
                { text: 'State', link: '/en/guide/state' },
                { text: 'Router API', link: '/en/guide/router-api' },
                { text: 'SSR', link: '/en/guide/ssr' },
                { text: 'Advanced', link: '/en/guide/advanced' },
              ],
            },
            {
              text: 'Framework Integration',
              items: [
                { text: 'React', link: '/en/guide/react' },
                { text: 'Preact', link: '/en/guide/preact' },
                { text: 'Solid.js', link: '/en/guide/solid' },
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
        nav: [
          { text: 'Главная', link: '/ru/' },
          { text: 'Руководство', link: '/ru/guide/', activeMatch: '/ru/guide/' },
          { text: 'Примеры', link: '/ru/examples/react', activeMatch: '/ru/examples/' },
        ],
        sidebar: {
          '/ru/guide/': [
            {
              text: 'Введение',
              items: [
                { text: 'Почему Reactive Route?', link: '/ru/guide/' },
                { text: 'Начало работы', link: '/ru/guide/getting-started' },
                { text: 'Основные концепции', link: '/ru/guide/core-concepts' },
              ],
            },
            {
              text: 'API',
              items: [
                { text: 'Конфигурация', link: '/ru/guide/config' },
                { text: 'Состояние', link: '/ru/guide/state' },
                { text: 'Router API', link: '/ru/guide/router-api' },
                { text: 'SSR', link: '/ru/guide/ssr' },
                { text: 'Продвинутое использование', link: '/ru/guide/advanced' },
              ],
            },
            {
              text: 'Интеграция с фреймворками',
              items: [
                { text: 'React', link: '/ru/guide/react' },
                { text: 'Preact', link: '/ru/guide/preact' },
                { text: 'Solid.js', link: '/ru/guide/solid' },
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
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dkazakov8/reactive-route' }],
    footer: {
      message: 'Released under the MIT License',
    },
  },
});
