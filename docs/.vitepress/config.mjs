import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'


export default defineConfig({
  title: 'Reactive Route',
  description: 'Config-based routing for different frameworks',
  base: '/',
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Reactive Route?', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Routes Configuration', link: '/guide/routes-configuration' },
            { text: 'Router Store', link: '/guide/router-store' },
            { text: 'SSR', link: '/guide/ssr' },
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'React', link: '/guide/react' },
            { text: 'Preact', link: '/guide/preact' },
            { text: 'Solid.js', link: '/guide/solid' },
          ]
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'React with MobX', link: '/examples/react-mobx' },
            { text: 'Solid.js', link: '/examples/solid' },
          ]
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dkazakov8/reactive-route' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Dmitry Kazakov'
    }
  }
});