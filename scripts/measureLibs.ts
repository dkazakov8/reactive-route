import fs from 'node:fs';
import path from 'node:path';

import { getCompressedSize } from './getCompressedSize';
import { libsMapper, saveMetrics, TypeLibData } from './saveMetrics';

export async function measureLibs() {
  const versions: Record<keyof typeof libsMapper, string> = JSON.parse(
    fs.readFileSync(path.resolve('./scripts/sizeComparison/package.json'), 'utf8')
  ).dependencies;

  const entries = Object.entries(libsMapper) as Array<
    [keyof typeof libsMapper, (typeof libsMapper)[keyof typeof libsMapper]]
  >;

  const pairs = await Promise.all(
    entries.map(async ([libName, { entryPath, link }]) => {
      return [
        libName,
        { ...(await getCompressedSize(entryPath)), version: versions[libName] || '?', link },
      ] as const;
    })
  );

  saveMetrics({
    key: 'sizes',
    value: Object.fromEntries(pairs) as Record<keyof typeof libsMapper, TypeLibData>,
  });
}
