import * as fs from 'node:fs';
import * as path from 'node:path';

type TypeKey = 'size' | 'coverage' | 'tests' | 'e2e';

export function saveMetrics({ key, value }: { key: TypeKey; value: string | number }) {
  const metricsPath = path.resolve(process.cwd(), 'metrics.json');
  const metrics: Record<TypeKey, any> = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));

  if (metrics[key] === value) {
    console.log(`\x1b[32m[metrics]\x1b[0m unchanged ${key}: \x1b[33m${value}\x1b[0m`);

    return;
  }

  console.log(
    `\x1b[32m[metrics]\x1b[0m changed ${key}: \x1b[33m${metrics[key]}\x1b[0m -> \x1b[33m${value}\x1b[0m`
  );

  metrics[key] = value;

  fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf-8');
}
