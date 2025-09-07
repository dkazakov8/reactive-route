import { createRouterStore } from 'reactive-route';
import { batch, createRenderEffect } from 'solid-js';
import { createMutable, modifyMutable, produce } from 'solid-js/store';

import { routes } from './routes';

export function getRouterStore() {
  return createRouterStore({
    routes,
    batch,
    autorun: createRenderEffect,
    routeError500: routes.error500,
    makeObservable: createMutable,
    replaceObject: (obj, newObj) => {
      modifyMutable(
        obj,
        produce((state) => {
          if (typeof state === 'object' && state != null) {
            // biome-ignore lint/suspicious/useGuardForIn: false
            for (const variableKey in state) {
              delete state[variableKey];
            }
          }

          Object.assign(state || {}, newObj);
        })
      );
    },
  });
}
