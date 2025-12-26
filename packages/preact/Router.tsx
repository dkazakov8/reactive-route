import { useEffect, useRef, useState } from 'preact/hooks';
import { routerSetLoadedComponent, TypePropsRouter, TypeRoute } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const disposerRef = useRef<() => void>(null);

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

  useState(() => {
    props.router.adapters.batch(() => {
      props.beforeMount?.();

      routerSetLoadedComponent(props, config);

      disposerRef.current = props.router.adapters.autorun(() =>
        routerSetLoadedComponent(props, config)
      );
    });
  });

  useEffect(() => {
    return () => {
      disposerRef.current?.();
    };
  }, []);

  if (!config.loadedComponentName) return null;

  const LoadedComponent = props.router.routes[config.loadedComponentName].component;

  return <LoadedComponent {...config.currentProps} router={props.router} />;
}

export function Router<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const [Component] = useState(() => props.router.adapters.observer!(RouterInner));

  return <Component {...props} />;
}
