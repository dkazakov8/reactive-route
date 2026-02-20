import { expect } from 'vitest';

import { createConfigs, createRouter, TypeRouter, TypeState } from '../packages/core';
import { TypePayloadDefault, TypeURL } from '../packages/core/types';
import { getAdapters } from './helpers/getAdapters';

export const loader = () => Promise.resolve({ default: '' });

export const adapters = await getAdapters({ renderer: 'react', reactivity: 'mobx' });

export const v = {
  length: (v: string) => v.length > 2,
};

export function getConfigsDefault() {
  return {
    notFound: { path: '/error404', props: { errorNumber: 404 }, loader },
    internalError: { path: '/error500', props: { errorNumber: 500 }, loader },
  } as const;
}

export function demoRouter(configs: any) {
  return createRouter({
    adapters,
    configs: createConfigs({
      ...configs,
      ...getConfigsDefault(),
    }),
  });
}

export function checkURLPayload({
  router,
  pathname,
  payload,
  search,
  hash = '',
}: {
  router: TypeRouter<any>;
  pathname: TypeURL;
  payload: TypePayloadDefault;
  search: string;
  hash?: string;
}) {
  const urlWithoutSlash = pathname.slice(1);
  const urlsToCheck = [
    `${pathname}${search}${hash}`,
    `${pathname}/${search}${hash}`,
    `${urlWithoutSlash}${search}${hash}`,
    `${urlWithoutSlash}/${search}${hash}`,
    `${pathname}//${search}${hash}`,
    `${pathname}///${search}${hash}`,
  ];

  for (const checkURL of urlsToCheck) {
    const actualPayload = router.urlToPayload(checkURL);

    const errorMessage = `${checkURL} should have payload ${JSON.stringify(payload)} but has ${JSON.stringify(actualPayload)}\n`;

    expect(actualPayload).to.deep.eq(payload, errorMessage);
  }
}

export function checkStateFromPayload({
  router,
  payload,
  state,
}: {
  router: TypeRouter<any>;
  payload: TypePayloadDefault;
  state: Omit<TypeState<any>, 'isActive' | 'props'>;
}) {
  expect(router.payloadToState(payload)).to.deep.eq(
    Object.assign({ isActive: true, props: {} }, state)
  );
}
