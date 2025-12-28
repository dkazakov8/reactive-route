import { useEffect, useRef, useState } from 'react';
import { routerSetLoadedComponent, TypePropsRouter, TypeRoute } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const disposerRef = useRef<() => void>(null);
  const [{ routes, adapters }] = useState(() => props.router.getConfig());

  const [config] = useState<{
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  }>(() =>
    adapters.makeObservable({
      loadedComponentName: undefined,
      loadedComponentPage: undefined,
      currentProps: {},
    })
  );

  useState(() => {
    adapters.batch(() => {
      props.beforeMount?.();

      routerSetLoadedComponent(props, config);

      disposerRef.current = adapters.autorun(() => routerSetLoadedComponent(props, config));
    });
  });

  useEffect(() => {
    return () => {
      disposerRef.current?.();
    };
  }, []);

  if (!config.loadedComponentName) return null;

  const LoadedComponent = routes[config.loadedComponentName].component;

  return <LoadedComponent {...config.currentProps} router={props.router} />;
}

export function Router<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const [Component] = useState(() => props.router.getConfig().adapters.observer!(RouterInner));

  return <Component {...props} />;
}
