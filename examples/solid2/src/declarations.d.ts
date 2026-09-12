declare const PORT: number;
declare const SSR_ENABLED: boolean;
declare const REACTIVITY_SYSTEM: 'mobx' | 'kr-observable' | 'solid';

declare module '@solidjs/babel-plugin';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
