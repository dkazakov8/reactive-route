import fs from 'node:fs';
import path from 'node:path';

export default {
  load() {
    const globalPkg = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
    );
    const metrics = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'metrics.json'), 'utf8')
    );

    return {
      size: metrics.size,
      version: globalPkg.version,
      coverage: metrics.coverage,
      passedTests: metrics.tests,
    };
  },
};
