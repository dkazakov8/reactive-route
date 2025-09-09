import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { getInitialRoute, history, TypePropsRouter, TypeRoute } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  // const [c] = useState(() =>
  //   props.routerStore.adapters.makeObservable({
  //     secondsPassed: 0,
  //   })
  // );
  //
  // useEffect(() => {
  //   props.routerStore.adapters.autorun(() => {
  //     c.secondsPassed += 1;
  //     console.log('autorun set', c.secondsPassed, Date.now());
  //   });
  // }, []);
  //
  // console.log('render', c.secondsPassed, Date.now());
  //
  // return null;

  const disposerRef = useRef<() => void>(null);

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
          fallback: 'error404',
        }),
      });
    });
  }, []);

  const setComponent = useCallback((currentRouteName: keyof TRoutes) => {
    const componentConfig = props.routes[currentRouteName];

    props.beforeSetPageComponent?.(componentConfig);

    // props.routerStore.adapters.replaceObject(config, {
    //   currentProps: 'props' in componentConfig ? componentConfig.props || {} : {},
    //   loadedComponentName: currentRouteName,
    //   loadedComponentPage: componentConfig.pageName,
    // });

    config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
    config.loadedComponentName = currentRouteName;
    config.loadedComponentPage = componentConfig.pageName;
  }, []);

  const setLoadedComponent = useCallback(() => {
    const { loadedComponentName, loadedComponentPage } = config;
    const { currentRoute, isRedirecting } = props.routerStore;

    const currentRouteName = currentRoute.name;
    const currentRoutePage = currentRoute.pageName;

    let preventRedirect = false;
    if (isRedirecting) preventRedirect = true;
    else if (loadedComponentName === currentRouteName) preventRedirect = true;
    else if (loadedComponentPage != null && currentRouteName != null) {
      if (loadedComponentPage === currentRoutePage) {
        const componentConfig = props.routes[currentRouteName];
        props.routerStore.adapters.batch(() => {
          config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
        });
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    props.routerStore.adapters.batch(() => {
      if (!loadedComponentName) {
        setComponent(currentRouteName);
      } else {
        props.beforeUpdatePageComponent?.();

        setComponent(currentRouteName);
      }
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

export const Router = memo(
  <TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) => {
    const Component = props.routerStore.adapters.observer
      ? props.routerStore.adapters.observer(RouterInner)
      : RouterInner;

    return (<Component {...props} />) as any;
  }
);
