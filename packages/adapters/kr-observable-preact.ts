import { autorun, makeObservable } from 'kr-observable';
// @ts-ignore
import { observer } from 'kr-observable/preact';
import { TypeAdapters } from 'reactive-route';

export const adapters: TypeAdapters = {
  batch: (cb) => cb(),
  autorun,
  replaceObject: (obj, newObj) => {
    // biome-ignore lint/suspicious/useGuardForIn: false
    for (const variableKey in obj) {
      delete obj[variableKey];
    }
    Object.assign(obj as Record<string, any>, newObj);
  },
  makeObservable: makeObservable,
  observer,
};
