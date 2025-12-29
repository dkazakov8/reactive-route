import { routerSetLoadedComponent, TypePropsRouter, TypeRouteConfig } from 'reactive-route';
import { onCleanup, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends Record<string, TypeRouteConfig>>(
  props: TypePropsRouter<TRoutes>
) {
  const { adapters, routes } = props.router.getGlobalArguments();

  const config: {
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  } = adapters.makeObservable({
    loadedComponentName: undefined,
    loadedComponentPage: undefined,
    currentProps: {},
  });

  props.beforeMount?.();

  if (adapters.immediateSetComponent) {
    adapters.batch(() => {
      routerSetLoadedComponent(props, config);
    });
  }

  const disposer = adapters.autorun(() => routerSetLoadedComponent(props, config));

  onCleanup(() => {
    if (typeof disposer === 'function') disposer();
  });

  return (
    // @ts-ignore
    <Show when={config.loadedComponentName}>
      {/* @ts-ignore */}
      <Dynamic
        component={routes[config.loadedComponentName!].component}
        {...config.currentProps}
        router={props.router}
      />
    </Show>
  );
}
