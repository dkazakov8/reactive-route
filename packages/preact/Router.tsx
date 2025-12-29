import { useEffect, useRef, useState } from 'preact/hooks';
import { routerSetLoadedComponent, TypePropsRouter, TypeRouteConfig } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRouteConfig>>(
  props: TypePropsRouter<TRoutes>
) {
  const disposerRef = useRef<() => void>(null);
  const [{ routes, adapters }] = useState(() => props.router.getGlobalArguments());

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

export function Router<TRoutes extends Record<string, TypeRouteConfig>>(
  props: TypePropsRouter<TRoutes>
) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component {...props} />;
}
