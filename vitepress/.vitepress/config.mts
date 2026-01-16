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
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
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
                { text: 'Advanced', link: '/guide/advanced' },
              ],
            },
            {
              text: 'Framework Integration',
              items: [
                { text: 'React', link: '/guide/react' },
                { text: 'Preact', link: '/guide/preact' },
                { text: 'Solid.js', link: '/guide/solid' },
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
