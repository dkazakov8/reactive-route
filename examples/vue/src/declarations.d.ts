declare const PORT: number;
declare const SSR_ENABLED: boolean;
declare const REACTIVITY_SYSTEM: 'vue';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
