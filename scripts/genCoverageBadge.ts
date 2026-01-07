import * as fs from 'node:fs';
import * as path from 'node:path';

import { saveBadge } from './saveBadge';

const average = (arr: Array<any>) => arr.reduce((a, b) => a + b) / arr.length;

const summary: Record<string, { total: number; pct: number }> = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'test-results/coverage-summary.json'), 'utf-8')
).total;

console.log(
  JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'test-results/test-results.json'), 'utf-8')
  ).numPassedTests
);

const coverageByGroup = Object.values(summary)
  .filter((item) => item.total > 0)
  .map((item) => item.pct);

saveBadge({
  fileName: 'coverage.svg',
  label: 'coverage',
  message: `${average(coverageByGroup).toFixed(2)} %`,
});
