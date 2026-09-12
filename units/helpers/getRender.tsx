import type { TypeOptions } from './types';

export async function getRender(options: TypeOptions, App: any) {
  let renderFunction: any;
  let render!: () => Promise<{ container: { innerHTML: string }; unmount: () => void }>;

  if (typeof window === 'undefined') return render;

  if (options.renderer === 'react') {
    renderFunction = (await import('vitest-browser-react')).render;
  }
  if (options.renderer === 'preact') {
    renderFunction = (await import('vitest-browser-preact')).render;
  }
  if (options.renderer === 'solid') {
    renderFunction = (await import('@solidjs/testing-library')).render;
  }
  if (options.renderer === 'solid2') {
    renderFunction = (await import('@solidjs/web2')).render;
  }
  if (options.renderer === 'vue') {
    renderFunction = (await import('vitest-browser-vue')).render;
  }

  if (options.renderer === 'react') {
    render = async () => await renderFunction(<App />);
  }
  if (options.renderer === 'preact') {
    render = async () => await renderFunction(<App />);
  }
  if (options.renderer === 'solid') {
    render = () => renderFunction(() => <App />);
  }
  if (options.renderer === 'solid2') {
    render = async () => {
      const container = document.createElement('div');

      document.body.append(container);

      const dispose = renderFunction(() => <App />, container);

      return {
        container,
        unmount: () => {
          dispose();
          container.remove();
        },
      };
    };
  }
  if (options.renderer === 'vue') {
    render = async () => await renderFunction(App);
  }

  return render;
}
