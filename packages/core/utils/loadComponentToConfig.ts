import { TypeRoute } from '../types/TypeRoute';

export function loadComponentToConfig(params: { route: TypeRoute }): Promise<void> {
  const { route } = params;

  if (!route.component && route.loader) {
    const loadingFn = route.loader;

    return loadingFn().then((module: { default: any; pageName?: string }) => {
      const { default: component, pageName, ...rest } = module;

      route.component = component;
      route.otherExports = rest;
      route.pageName = pageName;
    });
  }

  return Promise.resolve();
}
