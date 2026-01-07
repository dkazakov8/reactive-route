import { autorun, observable, runInAction } from 'mobx';
// @ts-expect-error
import { observer } from 'mobx-preact';
import { TypeAdapters } from 'reactive-route';

export const adapters: TypeAdapters = {
  batch: runInAction,
  autorun,
  observer,
  replaceObject: (obj, newObj) => {
    runInAction(() => {
      for (const variableKey in obj) {
        /* v8 ignore if -- @preserve */
        if (Object.hasOwn(obj as Record<string, any>, variableKey)) {
          delete obj[variableKey];
        }
      }
      Object.assign(obj as Record<string, any>, newObj);
    });
  },
  makeObservable: observable,
};
