import type { TypeAdapters } from 'reactive-route';
import { createStore, createTrackedEffect, flush, type StoreSetter } from 'solid-js2';

type TypeStoreBinding = {
  path: Array<PropertyKey>;
  setStore: StoreSetter<any>;
};

const storeBindings = new WeakMap<object, TypeStoreBinding>();
const isServer = typeof window === 'undefined';
let trackedEffectDepth = 0;

function getStoreValue(store: Record<PropertyKey, any>, path: Array<PropertyKey>) {
  let value = store;

  for (const key of path) value = value[key];

  return value;
}

function createMutableStore(
  store: Record<PropertyKey, any>,
  setStore: StoreSetter<any>,
  path: Array<PropertyKey> = [],
  proxies = new WeakMap<object, object>()
): Record<PropertyKey, any> {
  const proxy = new Proxy(getStoreValue(store, path), {
    get(target, key) {
      const value = target[key];

      if (value === null || typeof value !== 'object') return value;

      const existingProxy = proxies.get(value);
      if (existingProxy) return existingProxy;

      return createMutableStore(store, setStore, [...path, key], proxies);
    },
    set(_target, key, value) {
      setStore((state) => {
        getStoreValue(state, path)[key] = value;
      });
      flush();

      return true;
    },
    deleteProperty(_target, key) {
      setStore((state) => {
        delete getStoreValue(state, path)[key];
      });
      flush();

      return true;
    },
  });

  proxies.set(getStoreValue(store, path), proxy);
  storeBindings.set(proxy, { path, setStore });

  return proxy;
}

export const adapters: TypeAdapters = {
  batch: (callback) => {
    callback();

    if (!isServer && trackedEffectDepth === 0) flush();
  },
  autorun: (callback) => {
    if (isServer) return callback();

    return createTrackedEffect(() => {
      trackedEffectDepth += 1;

      try {
        return callback();
      } finally {
        trackedEffectDepth -= 1;
      }
    });
  },
  replaceObject: (obj, newObj) => {
    const binding = storeBindings.get(obj);

    if (!binding) {
      // biome-ignore lint/suspicious/useGuardForIn: false
      for (const variableKey in obj) delete obj[variableKey];

      Object.assign(obj, newObj);

      return;
    }

    binding.setStore((store) => {
      const state = getStoreValue(store, binding.path);

      // biome-ignore lint/suspicious/useGuardForIn: false
      for (const variableKey in state) {
        delete state[variableKey];
      }

      Object.assign(state, newObj);
    });
    flush();
  },
  makeObservable: (obj) => {
    if (isServer) return obj;

    const [store, setStore] = createStore<Record<string, any>>(obj);

    return createMutableStore(store, setStore) as typeof obj;
  },
};
