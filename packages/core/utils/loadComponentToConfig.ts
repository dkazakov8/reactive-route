import { TypeRoute } from '../types';

export function loadComponentToConfig(params: { route: TypeRoute }): Promise<void> {
  const { route } = params;

  if (!route.component) {
    return route.loader().then((module: { default: any }) => {
      const { default: component, ...rest } = module;

      route.component = component;
      route.otherExports = rest;
    });
  }

  return Promise.resolve();
}
