import {
  handleComponentRerender,
  type PropsRouter,
  type TypeConfigsDefault,
  type TypeRouterLocalObservable,
} from 'reactive-route';
import { onCleanup, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TConfigs extends TypeConfigsDefault>(props: PropsRouter<TConfigs>) {
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
    // biome-ignore lint/suspicious/noTsIgnore: analyze fails otherwise
    // @ts-ignore
    <Dynamic
      component={localObservable.renderedName ? Component! : undefined}
      {...localObservable.props}
    />
  );
}
