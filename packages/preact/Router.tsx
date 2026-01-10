import { useEffect, useRef, useState } from 'preact/hooks';
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeRouteConfig,
  type TypeRouterLocalObservable,
} from 'reactive-route';

function RouterInner<TRoutes extends Record<string, TypeRouteConfig>>(props: PropsRouter<TRoutes>) {
  const [{ adapters }] = useState(() => props.router.getGlobalArguments());

  const disposerRef = useRef<() => void>(null);
  const ComponentRef = useRef<any>(null);

  const [localObservable] = useState<TypeRouterLocalObservable>(() =>
    adapters.makeObservable({
      renderedRouteName: undefined,
      currentProps: {},
    })
  );

  useState(() => {
    handleComponentRerender(props, localObservable, (component) => {
      ComponentRef.current = component;
    });

    disposerRef.current = adapters.autorun(() =>
      handleComponentRerender(props, localObservable, (component) => {
        ComponentRef.current = component;
      })
    );
  });

  useEffect(
    () => () => {
      disposerRef.current?.();
    },
    []
  );

  if (!localObservable.renderedRouteName || !ComponentRef.current) return null;

  return <ComponentRef.current {...localObservable.currentProps} />;
}

export function Router<TRoutes extends Record<string, TypeRouteConfig>>(
  props: PropsRouter<TRoutes>
) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component {...props} />;
}
