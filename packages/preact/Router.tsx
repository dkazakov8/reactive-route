import { useEffect, useRef, useState } from 'preact/hooks';
import {
  handleComponentRerender,
  type TypePropsRouter,
  type TypeRouterLocalObservable,
  type TypeRoutesDefault,
} from 'reactive-route';

function RouterInner<TRoutes extends TypeRoutesDefault>(props: TypePropsRouter<TRoutes>) {
  const [{ adapters }] = useState(() => props.router.getGlobalArguments());

  const disposerRef = useRef<() => void>(null);
  const ComponentRef = useRef<any>(null);

  const [localObservable] = useState<TypeRouterLocalObservable>(() =>
    adapters.makeObservable({
      renderedName: undefined,
      props: {},
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

  if (!localObservable.renderedName || !ComponentRef.current) return null;

  return <ComponentRef.current {...localObservable.props} />;
}

export function Router<TRoutes extends TypeRoutesDefault>(props: TypePropsRouter<TRoutes>) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component router={props.router} />;
}
