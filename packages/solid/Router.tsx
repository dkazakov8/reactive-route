import {
  handleComponentRerender,
  type TypePropsRouter,
  type TypeRouterLocalObservable,
  type TypeRoutesDefault,
} from 'reactive-route';
import { onCleanup, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends TypeRoutesDefault>(props: TypePropsRouter<TRoutes>) {
  const { adapters } = props.router.getGlobalArguments();

  const localObservable: TypeRouterLocalObservable = adapters.makeObservable({
    renderedName: undefined,
    props: {},
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
      component={localObservable.renderedName ? Component! : undefined}
      {...localObservable.props}
    />
  );
}
