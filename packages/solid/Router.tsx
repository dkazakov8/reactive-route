import {
  handleComponentRerender,
  type PropsRouter,
  type TypeRouterLocalObservable,
  type TypeRoutesDefault,
} from 'reactive-route';
import { onCleanup, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends TypeRoutesDefault>(props: PropsRouter<TRoutes>) {
  const { adapters } = props.router.getGlobalArguments();

  const localObservable: TypeRouterLocalObservable = adapters.makeObservable({
    renderedRouteName: undefined,
    currentProps: {},
  });

  let Component: ValidComponent;

  if (typeof window === 'undefined') {
    handleComponentRerender(props, localObservable, (component) => {
      Component = component;
    });
  } else {
    const disposer = adapters.autorun(() =>
      handleComponentRerender(props, localObservable, (component) => {
        Component = component;
      })
    );

    onCleanup(() => {
      if (typeof disposer === 'function') disposer();
    });
  }

  return (
    // @ts-ignore
    <Dynamic
      component={localObservable.renderedRouteName ? Component! : undefined}
      {...localObservable.currentProps}
    />
  );
}
