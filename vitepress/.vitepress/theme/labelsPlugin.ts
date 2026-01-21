// @ts-ignore
import Markdown from 'markdown-it';
import { Options, Renderer, Token } from 'markdown-it/dist/index.cjs';

export function labelsPlugin(md: Markdown) {
  const labels = {
    ru: {
      tip: 'Совет',
      info: 'Дополнительно',
      warning: 'Осторожно',
    },
  };

  const blockNames = Object.keys(labels.ru);

  for (const name of blockNames) {
    const rule = md.renderer.rules[`container_${name}_open`];

    if (!rule) continue;

    md.renderer.rules[`container_${name}_open`] = (
      tokens: Array<Token>,
      idx: number,
      options: Options,
      env: any,
      self: Renderer
    ) => {
      const token = tokens[idx];
      const info = token.info.trim().slice(name.length).trim();

      if (!info && env.relativePath?.startsWith('ru/')) {
        token.info = `${name} ${labels.ru[name]}`;
      }

      return rule(tokens, idx, options, env, self);
    };
  }
}
