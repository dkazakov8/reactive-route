import { createConfigs } from 'reactive-route';
import { describe, expect, it, vi } from 'vitest';

import { attachReactivity } from './helpers/attachReactivity';
import { getAdapters } from './helpers/getAdapters';
import { getPageComponents } from './helpers/getPageComponents.ts';
import { prepareRouterTest } from './helpers/prepareRouterTest';
import type { TypeOptions } from './helpers/types';

const options = OPTIONS as TypeOptions;

await attachReactivity(options);

describe
  .runIf(
    typeof window !== 'undefined' &&
      (options.renderer === 'solid' || options.renderer === 'solid2') &&
      (options.reactivity === 'mobx' || options.reactivity === 'kr-observable')
  )
  .each([options])(`Router external reactivity [browser]: %s`, () => {
  it('Rerenders a component after an external observable changes', async () => {
    const { components } = getPageComponents(options);

    const adapters = await getAdapters(options);

    const store = adapters.makeObservable({ value: 0 });

    const externalObservable =
      options.renderer === 'solid'
        ? () => import('./pages/solid/ExternalObservable')
        : () => import('./pages/solid/ExternalObservable');

    const { router, render } = await prepareRouterTest({
      options,
      configs: createConfigs({
        externalObservable: {
          path: '/external-observable',
          loader: externalObservable,
          props: { store },
        },
        notFound: { path: '/error404', props: { error: 404 }, loader: components.notFound },
        internalError: {
          path: '/error500',
          props: { error: 500 },
          loader: components.internalError,
        },
      }),
    });

    const screen = await render();

    await router.redirect({ name: 'externalObservable' });

    expect(screen.container.innerHTML).to.eq('<div>0</div>');

    adapters.batch(() => {
      store.value = 1;
    });

    await vi.waitFor(() => expect(screen.container.innerHTML).to.eq('<div>1</div>'));

    screen.unmount();
  });
});
