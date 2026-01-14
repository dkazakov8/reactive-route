import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

export default defineConfig({
  title: 'Reactive Route',
  description: 'Config-based routing for different frameworks',
  base: '/reactive-route/',
  head: [['link', { rel: 'icon', href: '/file.svg' }]],
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
          ],
        },
      ],
    },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dkazakov8/reactive-route' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2017-present Dmitry Kazakov',
    },
  },
});
