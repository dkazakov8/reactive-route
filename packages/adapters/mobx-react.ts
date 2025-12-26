import { autorun, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { TypeAdapters } from 'reactive-route';

export const adapters: TypeAdapters = {
  batch: runInAction,
  autorun,
  observer,
  replaceObject: (obj, newObj) => {
    runInAction(() => {
      for (const variableKey in obj) {
        /* v8 ignore if -- @preserve */
        if ((obj as Record<string, any>).hasOwnProperty(variableKey)) {
          delete obj[variableKey];
        }
      }
      Object.assign(obj as Record<string, any>, newObj);
    });
  },
  makeObservable: observable,
};
