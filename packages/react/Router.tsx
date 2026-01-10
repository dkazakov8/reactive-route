import { FC, useEffect, useRef, useState } from 'react';
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeRouterLocalObservable,
  type TypeRoutesDefault,
} from 'reactive-route';

function RouterInner<TRoutes extends TypeRoutesDefault>(props: PropsRouter<TRoutes>) {
  const [{ adapters }] = useState(() => props.router.getGlobalArguments());

  const disposerRef = useRef<() => void>(null);
  const ComponentRef = useRef<FC>(null);

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

export function Router<TRoutes extends TypeRoutesDefault>(props: PropsRouter<TRoutes>) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component router={props.router} />;
}
