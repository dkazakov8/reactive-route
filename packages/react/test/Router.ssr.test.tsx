import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { prepareComponentWithSpy } from '../../shared/helpers';

const prepareParams = {
  renderer: 'react',
  reactivity: 'mobx',
  ssrRender: true,
} as const;

describe('Router', () => {
  it('SSR', async () => {
    const { routerStore, App, checkSpy, calls } = prepareComponentWithSpy(prepareParams);

    await routerStore.redirectTo({ route: 'staticRoute' });

    const html1 = renderToString(<App />);
    expect(html1).to.eq('Static');

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 1;

    checkSpy();

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

    const html2 = renderToString(<App />);
    expect(html2).to.eq('<div>Dynamic</div>');

    calls.renderTimes += 1;
    calls.beforeSetPageComponent += 2;
    calls.beforeUpdatePageComponent += 1;

    checkSpy();
  });
});
