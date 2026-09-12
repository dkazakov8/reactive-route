import { Dynamic } from '@solidjs/web2';
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeConfigsDefault,
  type TypeRouterLocal,
} from 'reactive-route';
import { createSignal, onSettled, untrack } from 'solid-js2';

export function Router<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>): any {
  const { adapters } = untrack(() => props.router.getGlobalArguments());

  const localState: TypeRouterLocal = { renderedName: undefined };
  const [count, setCount] = createSignal(1, { ownedWrite: true });

  let ComponentRef: any;
  let componentPropsRef: Record<string, any> = {};

  const disposer = adapters.autorun(() =>
    handleComponentRerender(props, localState, (component, componentProps) => {
      ComponentRef = component;
      componentPropsRef = componentProps;

      if (typeof window !== 'undefined') setCount((value) => value + 1);
    })
  );

  if (typeof disposer === 'function') onSettled(() => disposer);

  return (
    <Dynamic
      component={count() > 0 ? ComponentRef! : undefined}
      {...(count() > 0 ? componentPropsRef : {})}
    />
  );
}
