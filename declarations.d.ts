declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const OPTIONS: any;

declare module '@solidjs/babel-plugin';
