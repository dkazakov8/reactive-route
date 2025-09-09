import { autorun, makeObservable } from 'kr-observable';
// @ts-ignore
import { observer } from 'kr-observable/react';
import { TypeAdapters } from 'reactive-route';

export const adapters: TypeAdapters = {
  batch: (cb) => cb(),
  autorun,
  replaceObject: (obj, newObj) => {
    for (const variableKey in obj) {
      if ((obj as Record<string, any>).hasOwnProperty(variableKey)) {
        delete obj[variableKey];
      }
    }
    Object.assign(obj as Record<string, any>, newObj);
  },
  makeObservable: makeObservable,
  makeAutoObservable: makeObservable,
  observer,
};
