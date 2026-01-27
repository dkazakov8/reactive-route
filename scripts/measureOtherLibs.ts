import fs from 'node:fs';
import path from 'node:path';

import { getCompressedSize } from './getCompressedSize';
import { libsMapper, saveMetrics, TypeLibData } from './saveMetrics';

export async function measureOtherLibs() {
  const versions: Record<keyof typeof libsMapper, string> = JSON.parse(
    fs.readFileSync(path.resolve('./scripts/sizeComparison/package.json'), 'utf8')
  ).dependencies;

  const entries = Object.entries(libsMapper) as Array<[keyof typeof libsMapper, string]>;

  const pairs = await Promise.all(
    entries.map(async ([libName, entryPath]) => {
      return [
        libName,
        { ...(await getCompressedSize(entryPath)), version: versions[libName] || '?' },
      ] as const;
    })
  );

  saveMetrics({
    key: 'sizes',
    value: Object.fromEntries(pairs) as Record<keyof typeof libsMapper, TypeLibData>,
  });
}
