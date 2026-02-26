import { useEffect, useRef, useState } from 'preact/hooks';
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeConfigsDefault,
  type TypeRouterLocal,
} from 'reactive-route';

function RouterInner<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>) {
  const [{ adapters }] = useState(() => props.router.getGlobalArguments());

  const disposerRef = useRef<() => void>(null);
  const ComponentRef = useRef<any>(null);

  const [localObservable] = useState<TypeRouterLocal>(() =>
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

export function Router<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component router={props.router} />;
}
