import * as fs from 'node:fs';
import * as path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

export const libsMapper = {
  'reactive-route': {
    entryPath: path.resolve('./scripts/sizeComparison/reactive-route.ts'),
    link: 'https://github.com/m-dmitry/reactive-route',
  },
  '@kitbag/router': {
    entryPath: path.resolve('./scripts/sizeComparison/kitbag.ts'),
    link: 'https://router.kitbag.dev/',
  },
  'mobx-router': {
    entryPath: path.resolve('./scripts/sizeComparison/mobx-router.ts'),
    link: 'https://github.com/kitze/mobx-router',
  },
  'react-router': {
    entryPath: path.resolve('./scripts/sizeComparison/react-router.ts'),
    link: 'https://reactrouter.com/',
  },
  '@tanstack/react-router': {
    entryPath: path.resolve('./scripts/sizeComparison/tanstack.ts'),
    link: 'https://tanstack.com/router',
  },
  'vue-router': {
    entryPath: path.resolve('./scripts/sizeComparison/vue-router.ts'),
    link: 'https://router.vuejs.org/',
  },
  '@solidjs/router': {
    entryPath: path.resolve('./scripts/sizeComparison/solid-router.ts'),
    link: 'https://docs.solidjs.com/solid-router/',
  },
} as const;

export type TypeLibData = {
  minified: number;
  compressed: number;
  version: string;
  link: string;
};

export type TypeMetrics = {
  coverage?: string;
  units?: number;
  e2e?: number;
  sizes?: { [K in keyof typeof libsMapper]: TypeLibData };
};

const logPrefix = '\x1b[32m[metrics]\x1b[0m';

function getSizeChanges(prevMetrics?: TypeMetrics['sizes'], nextMetrics?: TypeMetrics['sizes']) {
  function formatSize(libData?: TypeLibData) {
    if (!libData) return 'undefined';
    return `\x1b[33m${libData.minified}kb (${libData.compressed}kb)\x1b[0m`;
  }

  return (Object.keys(libsMapper) as Array<keyof typeof libsMapper>)
    .map((libName) => {
      const libDataPrev = prevMetrics?.[libName];
      const libDataNext = nextMetrics?.[libName];

      let logString = ` \x1b[36m${libName}\x1b[0m: ${formatSize(libDataPrev)}`;

      if (libDataNext && !isDeepStrictEqual(libDataPrev, libDataNext)) {
        logString += ` -> ${formatSize(libDataNext)}`;
      }

      return logString;
    })
    .join('\n');
}

export function saveMetrics({
  key,
  value,
}: {
  [K in keyof TypeMetrics]-?: { key: K; value: TypeMetrics[K] };
}[keyof TypeMetrics]) {
  const metricsPath = path.resolve(process.cwd(), 'metrics.json');
  const metrics: TypeMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));

  if (isDeepStrictEqual(metrics[key], value)) {
    console.log(
      `${logPrefix} unchanged ${key}: ${
        key === 'sizes' ? `\n${getSizeChanges(value)}` : `\x1b[33m${String(value)}\x1b[0m`
      }`
    );
  } else {
    console.log(
      `${logPrefix} changed ${key}: ${
        key === 'sizes'
          ? `\n${getSizeChanges(metrics[key], value)}`
          : `\x1b[33m${String(metrics[key])}\x1b[0m -> \x1b[33m${String(value)}\x1b[0m`
      }`
    );

    (metrics as any)[key] = value;

    fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf-8');
  }
}
