import type { PropsRouter, TypeRouteConfig, TypeRouterLocalObservable } from 'reactive-route';
import { handleComponentRerender } from 'reactive-route';
import { onCleanup, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends Record<string, TypeRouteConfig>>(
  props: PropsRouter<TRoutes>
) {
  const { adapters, routes } = props.router.getGlobalArguments();

  const localObservable: TypeRouterLocalObservable = adapters.makeObservable({
    renderedRouteName: undefined,
    currentProps: {},
  });

  if (adapters.immediateSetComponent) {
    adapters.batch(() => {
      handleComponentRerender(props, localObservable);
    });
  }

  const disposer = adapters.autorun(() => handleComponentRerender(props, localObservable));

  onCleanup(() => {
    if (typeof disposer === 'function') disposer();
  });

  return (
    // @ts-ignore
    <Show when={localObservable.renderedRouteName}>
      {/* @ts-ignore */}
      <Dynamic
        component={routes[localObservable.renderedRouteName!].component}
        {...localObservable.currentProps}
      />
    </Show>
  );
}
