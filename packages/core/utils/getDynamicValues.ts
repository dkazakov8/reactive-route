import { TypeRoute } from '../types';

export function getDynamicValues<TRoute extends TypeRoute>(params: {
  route: TRoute;
  pathname: string;
}): Record<keyof TRoute['params'], string> {
  const { route, pathname } = params;

  const pathnameArray: Array<string> = pathname
    .replace(/\?.+$/, '')
    .split('/')
    .filter(Boolean)
    .map((str) => decodeURIComponent(str));
  const routePathnameArray: Array<keyof TRoute['params']> = route.path
    .split('/')
    .filter(Boolean) as any;
  const dynamicParams: Record<keyof TRoute['params'], string> = {} as any;

  for (let i = 0; i < routePathnameArray.length; i++) {
    const paramName = routePathnameArray[i];

    // @ts-ignore
    if (paramName[0] === ':') dynamicParams[paramName.slice(1)] = pathnameArray[i];
  }

  return dynamicParams;
}
