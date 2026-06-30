import { autorun, makeObservable, transaction } from 'kr-observable';
import type { TypeAdapters } from 'reactive-route';

export const adapters: TypeAdapters = {
  batch: transaction,
  autorun,
  replaceObject: (obj, newObj) => {
    // biome-ignore lint/suspicious/useGuardForIn: false
    for (const variableKey in obj) {
      delete obj[variableKey];
    }
    Object.assign(obj as Record<string, any>, newObj);
  },
  makeObservable,
};
