import { TypeRoute } from '../types';
import { queryString } from './queryString';

export function getQueryValues<TRoute extends TypeRoute>(params: {
  route: TRoute;
  pathname: string;
}): Record<Partial<keyof TRoute['query']>, string> {
  const { route, pathname } = params;

  if (!route.query) return {} as any;

  const query: Record<keyof TRoute['query'], string> = Object.fromEntries(
    new URLSearchParams(queryString.extract(pathname))
  ) as any;

  Object.entries(query).forEach(([key, value]) => {
    const validator = route.query![key];

    if (typeof validator !== 'function' || !validator(value as string)) {
      delete query[key as keyof TRoute['query']];
    }
  });

  return query;
}
