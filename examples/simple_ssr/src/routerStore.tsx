import { observable, runInAction } from 'mobx';
import { createRouterStore } from 'reactive-route';

import { routes } from './routes';

export const getRouterStore = () =>
  createRouterStore({
    routes,
    batch: runInAction,
    routeError500: routes.error500,
    makeObservable: observable,
    replaceObject: (obj, newObj) => {
      runInAction(() => {
        for (const variableKey in obj) {
          if ((obj as Record<string, any>).hasOwnProperty(variableKey)) {
            delete obj[variableKey];
          }
        }
        Object.assign(obj as Record<string, any>, newObj);
      });

      return obj;
    },
  });
