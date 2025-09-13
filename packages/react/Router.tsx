import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { getInitialRoute, history, TypePropsRouter, TypeRoute } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const disposerRef = useRef<() => void>(null);

  const redirectOnHistoryPop = useCallback(() => {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        props.routerStore.routesHistory[props.routerStore.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        props.routerStore.adapters.batch(() => props.routerStore.routesHistory.pop());
      }

      void props.routerStore.redirectTo({
        noHistoryPush: true,
        ...getInitialRoute({
          routes: props.routes,
          pathname: history.location.pathname,
        }),
      });
    });
  }, []);

  const [config] = useState<{
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  }>(() =>
    props.routerStore.adapters.makeObservable({
      loadedComponentName: undefined,
      loadedComponentPage: undefined,
      currentProps: {},
    })
  );

  const setLoadedComponent = useCallback(() => {
    const { loadedComponentName, loadedComponentPage } = config;
    const { currentRoute, isRedirecting } = props.routerStore;

    const componentConfig = props.routes[currentRoute.name];

    let preventRedirect = false;
    if (isRedirecting) preventRedirect = true;
    else if (loadedComponentName === currentRoute.name) preventRedirect = true;
    else if (loadedComponentPage != null && currentRoute.name != null) {
      if (loadedComponentPage === currentRoute.pageName) {
        props.routerStore.adapters.batch(() => {
          config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
          // @ts-ignore
          // config[Symbol.for('$adm')]?.batch();
        });
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    props.routerStore.adapters.batch(() => {
      if (loadedComponentName) props.beforeUpdatePageComponent?.();

      props.beforeSetPageComponent?.(componentConfig);

      config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
      config.loadedComponentName = currentRoute.name;
      config.loadedComponentPage = componentConfig.pageName;

      // @ts-ignore
      // config[Symbol.for('$adm')]?.batch();
    });
  }, []);

  useState(() => {
    props.routerStore.adapters.batch(() => {
      props.beforeMount?.();

      redirectOnHistoryPop();

      setLoadedComponent();

      disposerRef.current = props.routerStore.adapters.autorun(setLoadedComponent);
    });
  });

  useEffect(() => {
    return () => {
      disposerRef.current?.();
    };
  }, []);

  if (!config.loadedComponentName) return null;

  const LoadedComponent = props.routes[config.loadedComponentName]?.component || null;

  if (LoadedComponent) return (<LoadedComponent {...config.currentProps} />) as any;

  return null;
}

function RouterWrapper<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const Component = props.routerStore.adapters.observer
    ? props.routerStore.adapters.observer(RouterInner)
    : RouterInner;

  return (<Component {...props} />) as any;
}

export const Router = memo(RouterWrapper) as typeof RouterWrapper;
