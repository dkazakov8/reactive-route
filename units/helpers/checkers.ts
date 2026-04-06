import { expect, onTestFinished, vi } from 'vitest';

import { createConfigs, createRouter, type TypeRouter, type TypeState } from '../../packages/core';
import type { TypeBeforeEnter, TypeBeforeLeave, TypeURL } from '../../packages/core/types';
import { getAdapters } from './getAdapters';

export const loader = () => Promise.resolve({ default: '' });

export const adapters = await getAdapters({ renderer: 'react', reactivity: 'mobx' });

export const v = {
  length: (v: string) => v.length > 2,
};

export function getConfigsDefault() {
  return {
    notFound: { path: '/error404', props: { error: 404 }, loader },
    internalError: { path: '/error500', props: { error: 500 }, loader },
  } as const;
}

export function destroyAfterTest(router: TypeRouter<any, any>) {
  onTestFinished(() => {
    try {
      router.historySyncStop();
    } catch (_e) {
      // noop
    }
  });
}

export function untypedRouter(configs: any) {
  const router = createRouter({
    adapters,
    // @ts-expect-error
    configs: createConfigs({
      ...configs,
      ...getConfigsDefault(),
    }),
  });

  destroyAfterTest(router);

  return router;
}

export function checkStateCreation({
  router,
  state,

  pathname,
  search,
  hash = '',

  expectedState,
  expectedUrl,
}: {
  router: TypeRouter<any>;
  state: TypeState<any, any>;

  pathname: TypeURL;
  search: string;
  hash?: string;

  expectedState: TypeState<any, any>;
  expectedUrl: string;
}) {
  const pathnameNoSlash = pathname.slice(1);
  const sampleUrls = [
    `${pathname}${search}${hash}`,
    `${pathname}/${search}${hash}`,
    `${pathnameNoSlash}${search}${hash}`,
    `${pathnameNoSlash}/${search}${hash}`,
    `${pathname}//${search}${hash}`,
    `${pathname}///${search}${hash}`,
  ];

  for (const sampleUrl of sampleUrls) {
    const actualState = router.urlToState(sampleUrl);

    expect(actualState).to.deep.eq(
      expectedState,
      `urlToState:\nSample URL: ${sampleUrl}\nExpected state: ${JSON.stringify(expectedState)}\nActual state: ${JSON.stringify(actualState)}\n`
    );
  }

  const createdUrl = router.stateToUrl(state);

  expect(createdUrl).to.deep.eq(
    expectedUrl,
    `stateToUrl:\nRaw state: ${JSON.stringify(state)}\nExpected URL: ${expectedUrl}\nActual URL: ${createdUrl}\n`
  );
}

export function createBeforeEnterSpy() {
  const format = (obj: any) => JSON.stringify(obj, null, 2);

  const beforeEnter = vi.fn() as any;

  function checkLastArguments(expectedLifecycle: Omit<Parameters<TypeBeforeEnter>[0], 'redirect'>) {
    const actualLifecycle = beforeEnter.mock.lastCall?.[0];

    if (!actualLifecycle) return;

    expect(Object.keys(actualLifecycle).sort()).to.deep.eq([
      'currentState',
      'nextState',
      'reason',
      'redirect',
    ]);

    expect(actualLifecycle.reason).to.deep.eq(
      expectedLifecycle.reason,
      `reason mismatch: ${actualLifecycle.reason} !== ${expectedLifecycle.reason}`
    );
    expect(actualLifecycle.nextState).to.deep.eq(
      expectedLifecycle.nextState,
      `nextState mismatch: ${format(actualLifecycle.nextState)} !== ${format(expectedLifecycle.nextState)}`
    );
    expect(actualLifecycle.currentState).to.deep.eq(
      expectedLifecycle.currentState,
      `currentState mismatch: ${format(actualLifecycle.currentState)} !== ${format(expectedLifecycle.currentState)}`
    );
  }

  function checkCount(count: number) {
    expect(beforeEnter).toHaveBeenCalledTimes(count);
  }

  return { beforeEnter, checkLastArguments, checkCount };
}

export function createBeforeLeaveSpy() {
  const format = (obj: any) => JSON.stringify(obj, null, 2);

  const beforeLeave = vi.fn() as any;

  function checkLastArguments(
    expectedLifecycle: Omit<Parameters<TypeBeforeLeave>[0], 'preventRedirect'>
  ) {
    const actualLifecycle = beforeLeave.mock.lastCall?.[0];

    if (!actualLifecycle) return;

    expect(Object.keys(actualLifecycle).sort()).to.deep.eq([
      'currentState',
      'nextState',
      'preventRedirect',
      'reason',
    ]);

    expect(actualLifecycle.reason).to.deep.eq(
      expectedLifecycle.reason,
      `reason mismatch: ${actualLifecycle.reason} !== ${expectedLifecycle.reason}`
    );
    expect(actualLifecycle.nextState).to.deep.eq(
      expectedLifecycle.nextState,
      `nextState mismatch: ${format(actualLifecycle.nextState)} !== ${format(expectedLifecycle.nextState)}`
    );
    expect(actualLifecycle.currentState).to.deep.eq(
      expectedLifecycle.currentState,
      `createBeforeLeaveSpy:\nExpected currentState: ${format(expectedLifecycle.currentState)}\nActual currentState: ${format(actualLifecycle.currentState)}`
    );
  }

  function checkCount(count: number) {
    expect(beforeLeave).toHaveBeenCalledTimes(count);
  }

  return { beforeLeave, checkLastArguments, checkCount };
}

export function checkURL(params: {
  routerUrl: string;
  expectedUrl: string;
  expectedHistoryUrl?: string;
}) {
  expect(params.routerUrl).to.eq(
    params.expectedUrl,
    `checkURL:\nExpected routerUrl: ${params.expectedUrl}\nActual routerUrl: ${params.routerUrl}\n`
  );

  if (typeof window !== 'undefined') {
    expect(location.pathname + location.search).to.eq(
      params.expectedHistoryUrl || params.expectedUrl,
      `checkURL:\nExpected expectedHistoryUrl: ${params.expectedHistoryUrl || params.expectedUrl}\nActual browser url: ${location.pathname + location.search}\n`
    );
  }
}

export function checkHistory({
  url,
  content,
  checkSpy,
  container,
}: {
  url: string;
  content: string;
  container: { innerHTML: string };
  checkSpy?: () => void;
}) {
  expect(container.innerHTML).to.eq(content);

  checkSpy?.();

  expect(`${location.pathname}${location.search}`).to.eq(url);
}
