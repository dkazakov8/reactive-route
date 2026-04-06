/** biome-ignore-all lint/suspicious/noTsIgnore: no types */
import { parse } from 'node:path';

// @ts-ignore no types
import { transformAsync } from '@babel/core';
import type { pluginReplace } from '@espcom/esbuild-plugin-replace';

export function generateSolidModifier(
  ssr: boolean,
  replacer?: (source: string) => string
): Parameters<typeof pluginReplace>[0][number] {
  return {
    filter: /\.tsx?$/,
    replace: /.*/gs,
    replacer(onLoadArgs) {
      return async (source) => {
        source = replacer?.(source) || source;

        const result = await transformAsync(source, {
          presets: [
            ['babel-preset-solid', { generate: ssr ? 'ssr' : 'dom', hydratable: true }],
            ['@babel/preset-typescript'],
          ],
          filename: parse(onLoadArgs.path).base,
          sourceMaps: 'inline',
        });

        if (result?.code == null) {
          throw new Error('No result was provided from Babel');
        }

        return result.code;
      };
    },
  };
}
