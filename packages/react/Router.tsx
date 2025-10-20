import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { history, TypePropsRouter, TypeRoute } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const disposerRef = useRef<() => void>(null);

  const redirectOnHistoryPop = useCallback(() => {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        props.router.routesHistory[props.router.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        props.router.adapters.batch(() => props.router.routesHistory.pop());
      }

      void props.router.restoreFromURL({
        pathname: history.location.pathname,
        replace: true,
      });
    });
  }, []);

  const [config] = useState<{
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  }>(() =>
    props.router.adapters.makeObservable({
      loadedComponentName: undefined,
      loadedComponentPage: undefined,
      currentProps: {},
    })
  );

  const setLoadedComponent = useCallback(() => {
    const { loadedComponentName, loadedComponentPage } = config;
    const { currentRoute, isRedirecting } = props.router;

    const componentConfig = props.router.routes[currentRoute.name];

    let preventRedirect = false;
    if (isRedirecting) preventRedirect = true;
    else if (loadedComponentName === currentRoute.name) preventRedirect = true;
    else if (loadedComponentPage != null && currentRoute.name != null) {
      if (loadedComponentPage === currentRoute.pageId) {
        props.router.adapters.batch(() => {
          config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
        });
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    props.router.adapters.batch(() => {
      if (loadedComponentName) props.beforeUpdatePageComponent?.();

      props.beforeSetPageComponent?.(componentConfig);

      config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
      config.loadedComponentName = currentRoute.name;
      config.loadedComponentPage = componentConfig.pageId;
    });
  }, []);

  useState(() => {
    props.router.adapters.batch(() => {
      props.beforeMount?.();

      redirectOnHistoryPop();

      setLoadedComponent();

      disposerRef.current = props.router.adapters.autorun(setLoadedComponent);
    });
  });

  useEffect(() => {
    return () => {
      disposerRef.current?.();
    };
  }, []);

  if (!config.loadedComponentName) return null;

  const LoadedComponent = props.router.routes[config.loadedComponentName]?.component || null;

  if (LoadedComponent)
    return (<LoadedComponent {...config.currentProps} router={props.router} />) as any;

  return null;
}

function RouterWrapper<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const Component = props.router.adapters.observer
    ? props.router.adapters.observer(RouterInner)
    : RouterInner;

  return (<Component {...props} />) as any;
}

export const Router = memo(RouterWrapper) as typeof RouterWrapper;
