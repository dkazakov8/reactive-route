import { expect, vi } from 'vitest';

import { createRouter, TypeConfigsDefault } from '../../packages/core';
import { destroyAfterTest } from './checkers';
import { getAdapters } from './getAdapters';
import { getRender } from './getRender';
import { getRouterComponent } from './getRouterComponent';
import { getRouterContext } from './getRouterContext';
import { getServerRender } from './getServerRender';
import { TypeOptions } from './types';

export async function prepareRouterTest<TConfigs extends TypeConfigsDefault>({
  options,
  configs,
}: {
  options: TypeOptions;
  configs: TConfigs;
}) {
  const spy_pageRender = vi.fn();
  const spy_pageAutorun = vi.fn();
  const spy_beforeComponentChange = vi.fn();

  if (configs.autorun) {
    configs.autorun.props = { spy_pageRender, spy_pageAutorun };
  }

  const adapters = await getAdapters(options);

  const router = createRouter({
    configs,
    adapters,
    beforeComponentChange: spy_beforeComponentChange,
  });

  destroyAfterTest(router);

  const calls = { pageRender: 0, pageAutorun: 0, beforeComponentChange: 0 };

  function checkSpy(autorunStateName?: string) {
    expect(spy_pageRender, 'spy_pageRender').toHaveBeenCalledTimes(calls.pageRender);
    expect(spy_pageAutorun, 'spy_pageAutorun').toHaveBeenCalledTimes(calls.pageAutorun);
    expect(spy_beforeComponentChange, 'spy_beforeComponentChange').toHaveBeenCalledTimes(
      calls.beforeComponentChange
    );

    if (autorunStateName) {
      expect(spy_pageAutorun).toHaveBeenLastCalledWith(autorunStateName);
    }
  }

  const Router = await getRouterComponent(options);
  const RouterContext = await getRouterContext(options);

  let App: any;

  if (options.renderer === 'vue') {
    const { h, defineComponent } = await import('vue');

    App = defineComponent({
      name: 'App',
      setup() {
        RouterContext({ router });

        return () => h(Router, { router });
      },
    });
  } else {
    App = () => (
      <RouterContext.Provider value={{ router }}>
        <Router router={router} />
      </RouterContext.Provider>
    );
  }

  const render = await getRender(options, App);
  const renderToString = await getServerRender(options, App);

  function waitForRedirect(callback: () => void) {
    if (typeof window === 'undefined') return;

    return new Promise((resolve) => {
      const listener = () => {
        resolve(null);

        window.removeEventListener('popstate', listener);
      };

      window.addEventListener('popstate', listener);

      callback();
    });
  }

  return {
    router,
    calls,
    checkSpy,
    render,
    renderToString,
    waitForRedirect,
    spy_pageRender: spy_pageRender as any,
    spy_pageAutorun: spy_pageAutorun as any,
  };
}
