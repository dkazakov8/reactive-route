import { TypeRoute } from '../types/TypeRoute';
import { TypeValidator } from '../types/TypeValidator';

export function isDynamic(param: string): boolean {
  return param[0] === ':';
}

export function isDynamicRoute<TRoute extends TypeRoute>(
  route: TRoute
): route is TRoute & { params: Record<keyof TRoute, TypeValidator> } {
  return 'params' in route;
}

export function clearDynamic(param: string): string {
  return param.replace(/^:/, '');
}
