import { history, TypePropsRouter, TypeRoute } from 'reactive-route';
import { defineComponent, h, onBeforeUnmount, onMounted, reactive } from 'vue';

export const Router = defineComponent({
  name: 'ReactiveRouteRouter',
  props: {
    // We keep the type generic via TS, but at runtime it's just any
    router: { type: Object, required: true },
    beforeSetPageComponent: { type: Function as any, required: false },
    beforeUpdatePageComponent: { type: Function as any, required: false },
    beforeMount: { type: Function as any, required: false },
  } as unknown as TypePropsRouter<Record<string, TypeRoute>>, // TS helper, runtime ignored
  setup(props: any) {
    const disposerRef: { current: null | (() => void) } = reactive({ current: null });

    const config: {
      loadedComponentName?: string;
      loadedComponentPage?: string;
      currentProps: Record<string, any>;
    } = props.router.adapters.makeObservable({
      loadedComponentName: undefined,
      loadedComponentPage: undefined,
      currentProps: {},
    });

    function redirectOnHistoryPop() {
      if (!history) return;

      history.listen((params) => {
        if (params.action !== 'POP') return;

        const previousRoutePathname =
          props.router.routesHistory[props.router.routesHistory.length - 2];

        if (previousRoutePathname === params.location.pathname) {
          props.router.routesHistory.pop();
        }

        void props.router.restoreFromURL({
          pathname: history.location.pathname,
          noHistoryPush: true,
        });
      });
    }

    function setLoadedComponent() {
      const currentRouteName = props.router.currentRoute.name;
      const currentRoutePage = props.router.currentRoute.pageId;

      const componentConfig = props.router.routes[currentRouteName];

      let preventRedirect = false;
      if (props.router.isRedirecting) preventRedirect = true;
      else if (config.loadedComponentName === currentRouteName) {
        preventRedirect = true;
      } else if (config.loadedComponentPage != null && currentRouteName != null) {
        if (config.loadedComponentPage === currentRoutePage) {
          props.router.adapters.replaceObject(
            config.currentProps,
            'props' in componentConfig ? componentConfig.props! : {}
          );
          preventRedirect = true;
        }
      }

      if (preventRedirect) return;

      props.router.adapters.batch(() => {
        if (config.loadedComponentName) {
          props.beforeUpdatePageComponent?.();
        }

        props.beforeSetPageComponent?.(componentConfig);

        props.router.adapters.batch(() => {
          props.router.adapters.replaceObject(
            config.currentProps,
            'props' in componentConfig ? componentConfig.props! : {}
          );
          config.loadedComponentName = currentRouteName;
          config.loadedComponentPage = componentConfig.pageId;
        });
      });
    }

    setLoadedComponent();

    onMounted(() => {
      props.beforeMount?.();

      redirectOnHistoryPop();

      if (props.router.adapters.immediateSetComponent) {
        props.router.adapters.batch(() => {
          setLoadedComponent();
        });
      }

      // Vue adapter's autorun should be compatible; if it uses watchEffect, it will just run; if it uses watch, user adapter should wrap accordingly
      const disposer = props.router.adapters.autorun(() => setLoadedComponent());
      // try to support possible disposer returns
      if (typeof disposer === 'function') disposerRef.current = disposer;
    });

    onBeforeUnmount(() => {
      disposerRef.current?.();
    });

    return () => {
      if (!config.loadedComponentName) return null;

      const LoadedComponent = (props.router.routes[config.loadedComponentName]?.component ||
        null) as any;
      if (!LoadedComponent) return null;

      // render dynamic component with current props and router
      return h(LoadedComponent as any, { ...(config.currentProps || {}), router: props.router });
    };
  },
});
