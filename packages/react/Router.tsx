import { useEffect, useRef, useState } from 'react';
import type { PropsRouter, TypeRouteConfig, TypeRouterLocalObservable } from 'reactive-route';
import { handleComponentRerender } from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRouteConfig>>(props: PropsRouter<TRoutes>) {
  const disposerRef = useRef<() => void>(null);
  const [{ routes, adapters }] = useState(() => props.router.getGlobalArguments());

  const [localObservable] = useState<TypeRouterLocalObservable>(() =>
    adapters.makeObservable({
      renderedRouteName: undefined,
      currentProps: {},
    })
  );

  useState(() => {
    adapters.batch(() => {
      handleComponentRerender(props, localObservable);

      disposerRef.current = adapters.autorun(() => handleComponentRerender(props, localObservable));
    });
  });

  useEffect(() => {
    return () => {
      disposerRef.current?.();
    };
  }, []);

  if (!localObservable.renderedRouteName) return null;

  const LoadedComponent = routes[localObservable.renderedRouteName].component;

  return <LoadedComponent {...localObservable.currentProps} />;
}

export function Router<TRoutes extends Record<string, TypeRouteConfig>>(
  props: PropsRouter<TRoutes>
) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component {...props} />;
}
