import { TypeAdapters } from 'reactive-route';
import { reactive, watchEffect } from 'vue';

export const adapters: TypeAdapters = {
  batch: (cb) => cb(),
  autorun: watchEffect,
  replaceObject: (obj, newObj) => {
    for (const variableKey in obj) {
      if ((obj as Record<string, any>).hasOwnProperty(variableKey)) {
        delete obj[variableKey];
      }
    }
    Object.assign(obj as Record<string, any>, newObj);
  },
  makeObservable: reactive as any,
};
