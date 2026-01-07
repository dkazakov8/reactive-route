import { modifierMobxObserverFC } from '@espcom/esbuild-plugin-replace';

export const componentWrapper = (REACTIVITY_SYSTEM: any) =>
  modifierMobxObserverFC({
    filter: /\.tsx?$/,
    customImport:
      REACTIVITY_SYSTEM === 'mobx'
        ? `import { observer } from 'mobx-react-lite';`
        : `import { observer } from 'kr-observable/react';`,
  });
