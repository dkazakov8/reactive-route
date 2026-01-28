import fs from 'node:fs';
import path from 'node:path';

import { TypeMetrics } from '../scripts/saveMetrics';

export default {
  load() {
    const globalPkg = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
    );
    const metrics: TypeMetrics = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'metrics.json'), 'utf8')
    );
    const passedTests = (metrics.units || 0) + (metrics.e2e || 0);

    const libs = Object.entries(metrics.sizes || {})
      .map(([key, info]) => ({
        name: key,
        color: '',
        link: info.link,
        version: info.version,
        minified: info.minified,
        compressed: info.compressed,
        reference: key === 'reactive-route',
        multiplier: '',
      }))
      .sort((a, b) => a.minified - b.minified);

    const referenceLib = libs[0];

    if (libs.length > 0) {
      const minSize = libs[0].minified;
      const maxSize = libs[libs.length - 1].minified;
      const sizeRange = maxSize - minSize;

      libs.forEach((lib) => {
        if (lib.name === 'reactive-route') {
          lib.color = 'var(--vp-c-brand-1)';

          return;
        } else {
          lib.multiplier = (lib.compressed / referenceLib.compressed).toFixed(1);
        }

        const ratio = (lib.minified - minSize) / sizeRange;
        // From Yellow (#ffb300 -> 255, 179, 0) to Red (#ca4245 -> 202, 66, 69)
        const r = Math.round(255 + (202 - 255) * ratio);
        const g = Math.round(179 + (66 - 179) * ratio);
        const b = Math.round(69 * ratio);

        lib.color = `rgb(${r}, ${g}, ${b})`;
      });
    }

    return {
      version: globalPkg.version,
      coverage: metrics.coverage,
      passedTests,
      metrics,
      libs,
      biggestLibMinified: Math.max(...libs.map(({ minified }) => minified)),
    };
  },
};
