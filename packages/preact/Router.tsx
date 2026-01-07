import { useEffect, useRef, useState } from 'preact/hooks';
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeAdapters,
  type TypeConfigsDefault,
  type TypeRouterLocal,
} from 'reactive-route';

function RouterInner<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>) {
  const [{ adapters }] = useState(() => props.router.getGlobalArguments());

  const disposerRef = useRef<ReturnType<TypeAdapters['autorun']>>(undefined);
  const ComponentRef = useRef<any>(null);
  const componentPropsRef = useRef<Record<string, any>>({});
  const localState: TypeRouterLocal = { renderedName: undefined };

  useState(() => {
    handleComponentRerender(props, localState, (component, componentProps) => {
      ComponentRef.current = component;
      componentPropsRef.current = componentProps;
    });

    disposerRef.current = adapters.autorun(() =>
      handleComponentRerender(props, localState, (component, componentProps) => {
        ComponentRef.current = component;
        componentPropsRef.current = componentProps;
      })
    );
  });

  useEffect(
    () => () => {
      disposerRef.current?.();
    },
    []
  );

  if (!props.router.activeName || !ComponentRef.current) return null;

  return <ComponentRef.current {...componentPropsRef.current} />;
}

export function Router<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>) {
  const [Component] = useState(() =>
    props.router.getGlobalArguments().adapters.observer!(RouterInner)
  );

  return <Component router={props.router} />;
}
