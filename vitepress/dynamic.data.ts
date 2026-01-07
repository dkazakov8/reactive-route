import path from "node:path";
import fs from "node:fs";

export default {
  load() {
    const globalPkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));

    const size = fs.readFileSync(path.resolve(process.cwd(), 'assets/core.svg'), 'utf-8')
      .match(/>(\d+\.?(\d+)?\s[\w%]+)</)?.[1];
    const coverage = fs.readFileSync(path.resolve(process.cwd(), 'assets/coverage.svg'), 'utf-8')
      .match(/>(\d+\.?(\d+)?\s[\w%]+)</)?.[1];


    const passedTests = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'test-results/test-results.json'), 'utf-8')
    ).numPassedTests

    return { size, version: globalPkg.version, coverage, passedTests };
  }
}
