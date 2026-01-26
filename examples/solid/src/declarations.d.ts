declare const PORT: number;
declare const SSR_ENABLED: string;
declare const REACTIVITY_SYSTEM: 'mobx' | 'kr-observable' | 'solid';

declare global {
  declare module 'solid-js' {
    // biome-ignore lint/style/noNamespace: false
    namespace JSX {
      interface HTMLAttributes {
        className?: string | undefined;
      }
    }
  }
}
