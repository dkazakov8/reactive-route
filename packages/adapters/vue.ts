import { TypeAdapters } from 'reactive-route';
import { reactive, watchEffect } from 'vue';

export const adapters: TypeAdapters = {
  batch: (cb) => cb(),
  autorun: (cb) => watchEffect(cb, { flush: 'pre' }),
  replaceObject: (obj, newObj) => {
    for (const variableKey in obj) {
      /* v8 ignore if -- @preserve */
      if ((obj as Record<string, any>).hasOwnProperty(variableKey)) {
        delete obj[variableKey];
      }
    }
    Object.assign(obj as Record<string, any>, newObj);
  },
  makeObservable: reactive as any,
};
