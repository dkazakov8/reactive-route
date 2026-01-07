import {
  handleComponentRerender,
  type PropsRouter,
  type TypeConfigsDefault,
  type TypeRouterLocal,
} from 'reactive-route';
import { createSignal, onCleanup, untrack, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>) {
  const { adapters } = props.router.getGlobalArguments();

  const localState: TypeRouterLocal = { renderedName: undefined };
  const [count, setCount] = createSignal(1);

  let ComponentRef: ValidComponent;
  let componentPropsRef: Record<string, any> = {};

  const disposer = adapters.autorun(() =>
    handleComponentRerender(props, localState, (component, componentProps) => {
      ComponentRef = component;
      componentPropsRef = componentProps;

      untrack(() => {
        setCount(count() + 1);
      });
    })
  );

  onCleanup(() => {
    if (typeof disposer === 'function') disposer();
  });

  return (
    // biome-ignore lint/suspicious/noTsIgnore: analyze fails otherwise
    // @ts-ignore
    <Dynamic
      component={props.router.activeName ? ComponentRef! : undefined}
      {...(count() > 0 ? componentPropsRef : {})}
    />
  );
}
