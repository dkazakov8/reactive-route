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
  const spy_beforeSetPageComponent = vi.fn();
  const spy_beforeUpdatePageComponent = vi.fn();

  const adapters = await getAdapters(options);
  const router = createRouter({ routes: getRoutes(options), adapters });

  router.getGlobalArguments().routes.staticRouteAutorun.props = {
    spy_pageRender,
    spy_pageAutorun,
  };

  const calls = {
    pageRender: 0,
    pageAutorun: 0,
    beforeSetPageComponent: 0,
    beforeUpdatePageComponent: 0,
  };

  function checkSpy() {
    expect(spy_pageRender, 'spy_pageRender').toHaveBeenCalledTimes(calls.pageRender);
    expect(spy_pageAutorun, 'spy_pageAutorun').toHaveBeenCalledTimes(calls.pageAutorun);
    expect(spy_beforeSetPageComponent, 'spy_beforeSetPageComponent').toHaveBeenCalledTimes(
      calls.beforeSetPageComponent
    );
    expect(spy_beforeUpdatePageComponent, 'spy_beforeUpdatePageComponent').toHaveBeenCalledTimes(
      calls.beforeUpdatePageComponent
    );
  }

  const Router = await getRouterComponent(options);

  let App: any;

  const props = {
    router,
    beforeSetPageComponent: spy_beforeSetPageComponent,
    beforeUpdatePageComponent: spy_beforeUpdatePageComponent,
  };

  if (options.renderer === 'vue') {
    const h = (await import('vue')).h;

    App = () => h(Router, props);
  } else {
    App = () => <Router {...props} />;
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
