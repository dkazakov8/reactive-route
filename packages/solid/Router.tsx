import { routerSetLoadedComponent, TypePropsRouter, TypeRoute } from 'reactive-route';
import { onCleanup, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const config: {
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  } = props.router.adapters.makeObservable({
    loadedComponentName: undefined,
    loadedComponentPage: undefined,
    currentProps: {},
  });

  props.beforeMount?.();

  if (props.router.adapters.immediateSetComponent) {
    props.router.adapters.batch(() => {
      routerSetLoadedComponent(props, config);
    });
  }

  const disposer = props.router.adapters.autorun(() => routerSetLoadedComponent(props, config));

  onCleanup(() => {
    if (typeof disposer === 'function') disposer();
  });

  return (
    // @ts-ignore
    <Show when={config.loadedComponentName}>
      {/* @ts-ignore */}
      <Dynamic
        component={props.router.routes[config.loadedComponentName!].component}
        {...config.currentProps}
        router={props.router}
      />
    </Show>
  );
}
