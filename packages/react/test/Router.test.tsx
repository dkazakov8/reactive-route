import 'global-jsdom/register';

import { describe, expect, it } from 'vitest';

import { prepareComponentWithSpy } from '../../core/test/helpers';

const prepareParams = {
  renderer: 'react',
  reactivity: 'mobx',
} as const;

describe('Router', () => {
  // it('Only beforeSetPageComponent called on first render2', async () => {
  //   const { routerStore, checkSpy, calls, render } = prepareComponentWithSpy({
  //     renderer: 'react',
  //     reactivity: 'kr-observable',
  //   });
  //
  //   const container = render();
  //
  //   await routerStore.redirectTo({ route: 'staticRoute' });
  //
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //
  //   calls.renderTimes += 1;
  //   calls.beforeSetPageComponent += 1;
  //
  //   expect(container.innerHTML).to.eq('Static');
  //
  //   checkSpy();
  // });

  it('Only beforeSetPageComponent called on first render', async () => {
    const { routerStore, checkSpy, calls, render } = prepareComponentWithSpy(prepareParams);

    const container = render();

    await routerStore.redirectTo({ route: 'staticRoute' });

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    expect(container.innerHTML).to.eq('Static');

    checkSpy();
  });

  it('No rerender and lifecycle if only params changed (with page name)', async () => {
    const { routerStore, render, checkSpy, calls } = prepareComponentWithSpy(prepareParams);

    const container = render();

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    expect(container.innerHTML).to.eq('<div>Dynamic</div>');

    checkSpy();

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'dsa' } });

    expect(container.innerHTML).to.eq('<div>Dynamic</div>');

    checkSpy();
  });

  it('No rerender and lifecycle if only params changed (without page name)', async () => {
    const { routerStore, render, checkSpy, calls } = prepareComponentWithSpy(prepareParams);

    const container = render();

    await routerStore.redirectTo({ route: 'noPageName', params: { foo: 'foo' } });

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    expect(container.innerHTML).to.eq('<div>No page name</div>');

    checkSpy();

    await routerStore.redirectTo({ route: 'noPageName', params: { foo: 'bar' } });

    expect(container.innerHTML).to.eq('<div>No page name</div>');

    checkSpy();
  });

  it('No rerender and lifecycle (same page name)', async () => {
    const { routerStore, render, checkSpy, calls } = prepareComponentWithSpy(prepareParams);

    const container = render();

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    expect(container.innerHTML).to.eq('<div>Dynamic</div>');

    checkSpy();

    await routerStore.redirectTo({ route: 'dynamicRoute2', params: { static: 'dsa' } });

    expect(container.innerHTML).to.eq('<div>Dynamic</div>');

    checkSpy();
  });

  it('Rerender and lifecycle (no page name)', async () => {
    const { routerStore, render, checkSpy, calls } = prepareComponentWithSpy(prepareParams);

    const container = render();

    await routerStore.redirectTo({ route: 'noPageName', params: { foo: 'bar' } });

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    expect(container.innerHTML).to.eq('<div>No page name</div>');

    checkSpy();

    await routerStore.redirectTo({ route: 'noPageName2', params: { foo: 'foo', bar: 'bar' } });

    calls.beforeSetPageComponent += 1;
    calls.beforeUpdatePageComponent += 1;

    expect(container.innerHTML).to.eq('<div>No page name</div>');

    checkSpy();
  });

  it('No rerender and lifecycle on props change', async () => {
    const { routerStore, render, checkSpy, calls } = prepareComponentWithSpy(prepareParams);

    const container = render();

    await routerStore.redirectTo({ route: 'error404' });

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    expect(container.innerHTML).to.eq('Error 404');

    checkSpy();

    await routerStore.redirectTo({ route: 'error500' });

    expect(container.innerHTML).to.eq('Error 500');

    checkSpy();
  });
});
