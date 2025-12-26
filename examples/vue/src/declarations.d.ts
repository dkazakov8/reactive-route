declare const PORT: number;
declare const SSR_ENABLED: boolean;
declare const REACTIVITY_SYSTEM: 'vue';

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
