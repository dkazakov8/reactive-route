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
      { text: 'API', link: '/api/' },
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
            { text: 'Router Configuration', link: '/guide/router-configuration' },
            { text: 'Router Store', link: '/guide/router-store' },
            { text: 'SSR', link: '/guide/ssr' },
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'React', link: '/guide/react' },
            { text: 'Solid.js', link: '/guide/solid' },
          ]
        },
        {
          text: 'State Management',
          items: [
            { text: 'MobX', link: '/guide/mobx' },
            { text: 'kr-observable', link: '/guide/kr-observable' },
            { text: 'Solid.js Reactivity', link: '/guide/solid-reactivity' },
          ]
        },
      ],
      '/api/': [
        {
          text: 'Core API',
          items: [
            { text: 'createRouterConfig', link: '/api/create-router-config' },
            { text: 'createRouterStore', link: '/api/create-router-store' },
            { text: 'Utility Functions', link: '/api/utility-functions' },
          ]
        },
        {
          text: 'React API',
          items: [
            { text: 'Router Component', link: '/api/react-router' },
            { text: 'useStore Hook', link: '/api/react-use-store' },
          ]
        },
        {
          text: 'Solid.js API',
          items: [
            { text: 'Router Component', link: '/api/solid-router' },
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