import { TypeConfigConfigurable, TypeCreatedConfigs, TypeErrorConfig, TypeExact } from './types';

export function createConfigs<
  const TConfig extends {
    [K in keyof TConfig]: K extends 'notFound' | 'internalError'
      ? TypeExact<TConfig[K], TypeErrorConfig>
      : TypeConfigConfigurable<TConfig[K] extends { path: infer P extends string } ? P : string>;
  } & {
    notFound: TypeErrorConfig;
    internalError: TypeErrorConfig;
  },
>(configs: TConfig): TypeCreatedConfigs<TConfig> {
  Object.entries(configs).forEach(([name, config]) => {
    (config as any).name = name;

    if (!(config as any).props) (config as any).props = {};
  });

  return configs as any;
}
