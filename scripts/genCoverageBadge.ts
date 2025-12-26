import * as fs from 'node:fs';
import * as path from 'node:path';

import { saveBadge } from './saveBadge';

const summaryPath = path.resolve(process.cwd(), 'test-results/coverage-summary.json');

const summary: Record<string, { total: number; pct: number }> = JSON.parse(
  fs.readFileSync(summaryPath, 'utf-8')
).total;

const average = (arr: Array<any>) => arr.reduce((a, b) => a + b) / arr.length;

const totalItems = Object.values(summary)
  .filter((item) => item.total > 0)
  .map((item) => item.pct);

saveBadge({
  fileName: 'coverage.svg',
  label: 'Coverage',
  message: `${average(totalItems).toFixed(2)} %`,
});
