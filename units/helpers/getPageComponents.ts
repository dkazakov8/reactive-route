import { TypeOptions } from './types';

export function getPageComponents(options: TypeOptions) {
  let components: {
    static: any;
    dynamic: any;
    autorun: any;
    notFound: any;
    internalError: any;
  } = {} as any;

  const expectedContent: Record<keyof typeof components, string> = {
    static: 'Static',
    dynamic: '<div>Dynamic</div>',
    autorun: 'StaticAutorun',
    notFound: 'Error 404',
    internalError: 'Error 500',
  };

  if (options.renderer === 'react') {
    if (options.reactivity === 'mobx') {
      components = {
        static: () => import('../pages/react/StaticMobx'),
        dynamic: () => import('../pages/react/DynamicMobx'),
        autorun: () => import('../pages/react/StaticAutorunMobx'),
        notFound: () => import('../pages/react/ErrorMobx'),
        internalError: () => import('../pages/react/ErrorMobx'),
      };
    }
    if (options.reactivity === 'kr-observable') {
      components = {
        static: () => import('../pages/react/StaticKrObservable'),
        dynamic: () => import('../pages/react/DynamicKrObservable'),
        autorun: () => import('../pages/react/StaticAutorunKrObservable'),
        notFound: () => import('../pages/react/ErrorKrObservable'),
        internalError: () => import('../pages/react/ErrorKrObservable'),
      };
    }
  }

  if (options.renderer === 'preact') {
    if (options.reactivity === 'mobx') {
      components = {
        static: () => import('../pages/preact/StaticMobx'),
        dynamic: () => import('../pages/preact/DynamicMobx'),
        autorun: () => import('../pages/preact/StaticAutorunMobx'),
        notFound: () => import('../pages/preact/ErrorMobx'),
        internalError: () => import('../pages/preact/ErrorMobx'),
      };
    }
    if (options.reactivity === 'kr-observable') {
      components = {
        static: () => import('../pages/preact/StaticKrObservable'),
        dynamic: () => import('../pages/preact/DynamicKrObservable'),
        autorun: () => import('../pages/preact/StaticAutorunKrObservable'),
        notFound: () => import('../pages/preact/ErrorKrObservable'),
        internalError: () => import('../pages/preact/ErrorKrObservable'),
      };
    }
  }

  if (options.renderer === 'solid') {
    components = {
      static: () => import('../pages/solid/Static'),
      dynamic: () => import('../pages/solid/Dynamic'),
      autorun: () => import('../pages/solid/StaticAutorun'),
      notFound: () => import('../pages/solid/Error'),
      internalError: () => import('../pages/solid/Error'),
    };
  }

  if (options.renderer === 'vue') {
    components = {
      static: () => import('../pages/vue/static'),
      dynamic: () => import('../pages/vue/dynamic'),
      autorun: () => import('../pages/vue/staticAutorun'),
      notFound: () => import('../pages/vue/error'),
      internalError: () => import('../pages/vue/error'),
    };
  }

  return { components, expectedContent };
}
