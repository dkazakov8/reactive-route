import { expect, vi } from 'vitest';

import { createRouter } from '../core';
import { getAdapters } from './getAdapters';
import { getRender } from './getRender';
import { getRouterComponent } from './getRouterComponent';
import { getRoutes } from './getRoutes';
import { getServerRender } from './getServerRender';
import { TypeOptions } from './types';

export async function prepareRouterTest(options: TypeOptions) {
  const spy_pageRender = vi.fn();
  const spy_pageAutorun = vi.fn();
  const spy_beforeComponentChange = vi.fn();

  const adapters = await getAdapters(options);
  const router = createRouter({
    routes: getRoutes(options),
    adapters,
    beforeComponentChange: spy_beforeComponentChange,
  });

  router.getGlobalArguments().routes.staticRouteAutorun.props = {
    spy_pageRender,
    spy_pageAutorun,
  };

  const calls = {
    pageRender: 0,
    pageAutorun: 0,
    beforeComponentChange: 0,
  };

  function checkSpy() {
    expect(spy_pageRender, 'spy_pageRender').toHaveBeenCalledTimes(calls.pageRender);
    expect(spy_pageAutorun, 'spy_pageAutorun').toHaveBeenCalledTimes(calls.pageAutorun);
    expect(spy_beforeComponentChange, 'spy_beforeComponentChange').toHaveBeenCalledTimes(
      calls.beforeComponentChange
    );
  }

  const Router = await getRouterComponent(options);

  let App: any;

  if (options.renderer === 'vue') {
    const h = (await import('vue')).h;

    App = () => h(Router, { router });
  } else {
    App = () => <Router router={router} />;
  }

  const render = await getRender(options, App);
  const renderToString = await getServerRender(options, App);

  return {
    router,
    calls,
    checkSpy,
    render,
    renderToString,
    spy_pageRender: spy_pageRender as any,
    spy_pageAutorun: spy_pageAutorun as any,
  };
}
