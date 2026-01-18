export type TypeOptions =
  | {
      renderer: 'solid';
      reactivity: 'solid';
    }
  | {
      renderer: 'solid';
      reactivity: 'kr-observable';
    }
  | {
      renderer: 'react';
      reactivity: 'mobx';
    }
  | {
      renderer: 'react';
      reactivity: 'kr-observable';
    }
  | {
      renderer: 'preact';
      reactivity: 'mobx';
    }
  | {
      renderer: 'preact';
      reactivity: 'kr-observable';
    }
  | {
      renderer: 'solid';
      reactivity: 'mobx';
    }
  | {
      renderer: 'vue';
      reactivity: 'vue';
    };

export const allPossibleOptions: Array<TypeOptions> = [
  {
    renderer: 'solid',
    reactivity: 'solid',
  },
  {
    renderer: 'solid',
    reactivity: 'kr-observable',
  },
  {
    renderer: 'react',
    reactivity: 'mobx',
  },
  {
    renderer: 'react',
    reactivity: 'kr-observable',
  },
  {
    renderer: 'preact',
    reactivity: 'mobx',
  },
  {
    renderer: 'preact',
    reactivity: 'kr-observable',
  },
  {
    renderer: 'solid',
    reactivity: 'mobx',
  },
  {
    renderer: 'vue',
    reactivity: 'vue',
  },
];
