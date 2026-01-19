import type { FullConfig, Reporter, Suite } from '@playwright/test/reporter';

import { saveMetrics } from '../../scripts/saveMetrics';

let totalTests = 0;

export default class PlaywrightReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    totalTests += suite.allTests().length;
  }

  onEnd() {
    saveMetrics({ key: 'e2e', value: totalTests });
  }
}
