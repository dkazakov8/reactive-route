import * as fs from 'node:fs';
import * as path from 'node:path';

type TypeKey = 'size' | 'coverage' | 'tests';

export function saveMetrics({ key, value }: { key: TypeKey; value: string | number }) {
  const metricsPath = path.resolve(process.cwd(), 'metrics.json');
  const metrics: Record<TypeKey, any> = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));

  if (metrics[key] === value) {
    console.log(`[metrics] unchanged ${key}: ${value}`);

    return;
  }

  console.log(`[metrics] changed ${key}: ${metrics[key]} -> ${value}`);

  metrics[key] = value;

  fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf-8');
}
