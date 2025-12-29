import { TypeRouteConfig } from '../types';

export async function loadComponentToConfig(params: { route: TypeRouteConfig }): Promise<void> {
  const { route } = params;

  if (!route.component) {
    const { default: component, ...rest } = await route.loader();

    route.component = component;
    route.otherExports = rest;
  }
}
