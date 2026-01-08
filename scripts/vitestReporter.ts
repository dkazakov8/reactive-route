import { TestModule } from 'vitest/node';
import { DefaultReporter } from 'vitest/reporters';

import { saveMetrics } from './saveMetrics';

const toArray = (arr: any) => (arr == null ? [] : Array.isArray(arr) ? arr : [arr]);

type TypeSummary = { statements: number; branches: number; functions: number; lines: number };

export function getTests(suite: any, tests: Array<any> = []): Array<any> {
  toArray(suite).forEach((task) =>
    task.type === 'test' ? tests.push(task) : getTests(task.tasks, tests)
  );

  return tests;
}

export function generateV8CoverageSummary(coverage: any): any {
  const fileCoverages: Record<
    string,
    {
      data?: {
        s?: Record<string, number>;
        f?: Record<string, number>;
        b?: Record<string, Array<number>>;
      };
    }
  > = coverage.data;

  const summary: TypeSummary = { statements: 0, branches: 0, functions: 0, lines: 0 };

  let totalStatements = 0;
  let totalBranches = 0;
  let totalFunctions = 0;
  let totalLines = 0;
  let totalCoveredStatements = 0;
  let totalCoveredBranches = 0;
  let totalCoveredFunctions = 0;
  let totalCoveredLines = 0;

  for (const fileCoverageObj of Object.values(fileCoverages)) {
    const fileCoverage = fileCoverageObj?.data;

    if (!fileCoverage || !fileCoverage.s || !fileCoverage.f || !fileCoverage.b) {
      continue;
    }

    for (const stmtCount of Object.values(fileCoverage.s)) {
      totalStatements++;
      totalLines++;

      if (stmtCount > 0) {
        totalCoveredStatements++;
        totalCoveredLines++;
      }
    }

    for (const fnCount of Object.values(fileCoverage.f)) {
      totalFunctions++;

      if (fnCount > 0) totalCoveredFunctions++;
    }

    for (const branchArr of Object.values(fileCoverage.b)) {
      for (const b of branchArr) {
        totalBranches++;

        if (b > 0) totalCoveredBranches++;
      }
    }
  }

  summary.statements =
    totalStatements > 0
      ? Math.round((totalCoveredStatements / totalStatements) * 10000) / 100
      : 100;
  summary.branches =
    totalBranches > 0 ? Math.round((totalCoveredBranches / totalBranches) * 10000) / 100 : 100;
  summary.functions =
    totalFunctions > 0 ? Math.round((totalCoveredFunctions / totalFunctions) * 10000) / 100 : 100;
  summary.lines = totalLines > 0 ? Math.round((totalCoveredLines / totalLines) * 10000) / 100 : 100;

  return summary;
}

export class VitestReporter extends DefaultReporter {
  onCoverage(coverage: any) {
    const average = (arr: Array<any>) => arr.reduce((a, b) => a + b) / arr.length;
    const summary = generateV8CoverageSummary(coverage);

    saveMetrics({ key: 'coverage', value: `${average(Object.values(summary)).toFixed(2)} %` });
  }
  async onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const files = testModules.map((testModule) => (testModule as any).task);

    const tests = getTests(files);
    const numPassedTests = tests.filter((t) => t.result?.state === 'pass').length;

    saveMetrics({ key: 'tests', value: numPassedTests });
  }
}
