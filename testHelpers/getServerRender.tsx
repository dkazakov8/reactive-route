import { TypeOptions } from './types';

export async function getServerRender(options: TypeOptions, App: any) {
  let renderFunction: any;
  let renderToString!: () => Promise<string>;

  if (typeof window !== 'undefined') return renderToString;

  if (options.renderer === 'react') {
    renderFunction = (await import('react-dom/server')).renderToString;
  }
  if (options.renderer === 'preact') {
    renderFunction = (await import('preact-render-to-string')).renderToString;
  }
  if (options.renderer === 'solid') {
    renderFunction = (await import('solid-js/web')).renderToString;
  }
  if (options.renderer === 'vue') {
    renderFunction = (await import('vue/server-renderer')).renderToString;
  }

  if (options.renderer === 'react') {
    renderToString = () => Promise.resolve(renderFunction(<App />));
  }
  if (options.renderer === 'preact') {
    renderToString = () => Promise.resolve(renderFunction(<App />));
  }
  if (options.renderer === 'solid') {
    renderToString = () => Promise.resolve(renderFunction(App));
  }
  if (options.renderer === 'vue') {
    const { createSSRApp } = await import('vue');

    renderToString = () => renderFunction(createSSRApp(App));
  }

  return renderToString;
}
