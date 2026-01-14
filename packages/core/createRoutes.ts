import { TypeRouteConfig, TypeRouteConfigInput } from './types';

export function createRoutes<
  const TConfig extends {
    [K in keyof TConfig]: TypeRouteConfigInput<
      TConfig[K] extends { path: infer P extends string } ? P : string
    >;
  } & {
    notFound: Omit<TypeRouteConfig, 'name' | 'component' | 'otherExports' | 'params' | 'query'>;
    internalError: Omit<
      TypeRouteConfig,
      'name' | 'component' | 'otherExports' | 'params' | 'query'
    >;
  },
>(
  config: TConfig
): {
  [Key in keyof TConfig]: TConfig[Key] & {
    name: Key;
    component?: TypeRouteConfig['component'];
    otherExports?: TypeRouteConfig['otherExports'];
  };
} {
  Object.entries(config).forEach(([key, value]) => {
    (value as any).name = key;
  });

  return config as any;
}
