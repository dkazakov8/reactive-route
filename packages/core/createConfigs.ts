import { TypeConfig, TypeConfigConfigurable } from './types';

export function createConfigs<
  const TConfig extends {
    [K in keyof TConfig]: TypeConfigConfigurable<
      TConfig[K] extends { path: infer P extends string } ? P : string
    >;
  } & {
    notFound: Omit<TypeConfig, 'name' | 'component' | 'otherExports' | 'params' | 'query'>;
    internalError: Omit<TypeConfig, 'name' | 'component' | 'otherExports' | 'params' | 'query'>;
  },
>(
  configs: TConfig
): {
  [Key in keyof TConfig]: TConfig[Key] & {
    name: Key;
    props: TypeConfig['props'];
    component?: TypeConfig['component'];
    otherExports?: TypeConfig['otherExports'];
  };
} {
  Object.entries(configs).forEach(([name, config]) => {
    (config as any).name = name;

    if (!config.props) config.props = {};
  });

  return configs as any;
}
