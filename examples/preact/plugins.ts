import { modifierMobxObserverFC } from '@espcom/esbuild-plugin-replace';

export const componentWrapper = (REACTIVITY_SYSTEM: any) =>
  modifierMobxObserverFC({
    filter: /\.tsx?$/,
    customImport:
      REACTIVITY_SYSTEM === 'mobx'
        ? `import { observer } from 'mobx-preact';`
        : `import { observer } from 'kr-observable/preact';`,
  });
