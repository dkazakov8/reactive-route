import { TypeCurrentRoute, TypeRoute } from '../types';

export function replaceDynamicValues<TRouteItem extends TypeRoute | TypeCurrentRoute<TypeRoute>>({
  route,
  params = {} as any,
}: {
  route: TRouteItem;
  params?: Record<keyof TRouteItem['params'], string>;
}): string {
  return route.path.replace(/[^/]+/g, (paramName) => {
    if (paramName[0] !== ':') return paramName;

    const value = params[paramName.slice(1) as keyof TRouteItem['params']];

    if (!value) {
      throw new Error(
        `replaceDynamicValues: no param "${paramName}" passed for route ${route.name}`
      );
    }

    return encodeURIComponent(value);
  });
}
