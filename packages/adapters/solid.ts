import { TypeAdapters } from 'reactive-route';
import { batch, createRenderEffect } from 'solid-js';
import { createMutable, modifyMutable, produce } from 'solid-js/store';

export const adapters: TypeAdapters = {
  batch,
  autorun: createRenderEffect,
  replaceObject: (obj, newObj) => {
    /* v8 ignore next -- @preserve */
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
  makeObservable: createMutable,
};
