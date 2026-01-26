import path from 'node:path';

import { getCompressedSize } from './getCompressedSize';
import { saveMetrics } from './saveMetrics';

export async function measureOtherLibs() {
  saveMetrics({
    key: 'size',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/reactive-route.ts')))
      .compressed,
  });

  saveMetrics({
    key: 'size_reactive_route_full',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/reactive-route.ts')))
      .minified,
  });
  saveMetrics({
    key: 'size_reactive_route_full_br',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/reactive-route.ts')))
      .compressed,
  });

  saveMetrics({
    key: 'size_kitbag_full',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/kitbag.ts'))).minified,
  });
  saveMetrics({
    key: 'size_kitbag_full_br',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/kitbag.ts'))).compressed,
  });

  saveMetrics({
    key: 'size_vue_router_full',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/vue-router.ts')))
      .minified,
  });
  saveMetrics({
    key: 'size_vue_router_full_br',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/vue-router.ts')))
      .compressed,
  });

  saveMetrics({
    key: 'size_mobx_router_full',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/mobx-router.ts')))
      .minified,
  });
  saveMetrics({
    key: 'size_mobx_router_full_br',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/mobx-router.ts')))
      .compressed,
  });

  saveMetrics({
    key: 'size_react_router_full',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/react-router.ts')))
      .minified,
  });
  saveMetrics({
    key: 'size_react_router_full_br',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/react-router.ts')))
      .compressed,
  });

  saveMetrics({
    key: 'size_tanstack_router_full',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/tanstack.ts'))).minified,
  });
  saveMetrics({
    key: 'size_tanstack_router_full_br',
    value: (await getCompressedSize(path.resolve('./scripts/sizeComparison/tanstack.ts')))
      .compressed,
  });
}
