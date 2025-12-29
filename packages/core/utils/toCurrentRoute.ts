import { replaceDynamicValues } from 'reactive-route';

import { TypeCurrentRoute, TypeRoute } from '../types';
import { getDynamicValues } from './getDynamicValues';
import { getQueryValues } from './getQueryValues';
import { queryString } from './queryString';

export function toCurrentRoute({
  route,
  paramsRaw,
  queryRaw,
}: {
  route: TypeRoute;
  paramsRaw?: Record<string, any>;
  queryRaw?: Record<string, any>;
}): TypeCurrentRoute<any> {
  const pathname = replaceDynamicValues({ route, params: paramsRaw as any });
  const params = getDynamicValues({ route, pathname });
  const query = getQueryValues({
    route,
    pathname: `${pathname}?${queryString.stringify(queryRaw || {})}`,
  });
  const search = Object.keys(query).length > 0 ? queryString.stringify(query) : '';
  const url = Object.keys(query).length > 0 ? `${pathname}?${search}` : pathname;

  return {
    name: route.name,
    path: route.path,
    props: route.props,
    pageId: route.pageId,
    isActive: true,
    url,
    query,
    params,
    search,
    pathname,
  };
}
