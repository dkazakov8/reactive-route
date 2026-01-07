const WRAP_TYPE = '__VP_WRAP_TYPE__';
const WRAP_OBJECT = '__VP_WRAP_OBJECT__';

function hasWrapMeta(options: Record<string, unknown>, metaWord: string) {
  const raw = [
    options.meta,
    (options as { metaString?: string }).metaString,
    (options.meta as { __raw?: string } | undefined)?.__raw,
  ]
    .filter(Boolean)
    .map(String)
    .join(' ');

  return new RegExp(`\\b${metaWord}\\b`).test(raw);
}

export const wrapTransformer = {
  name: 'ts-wrap-meta-transformer',

  preprocess(code: string, options: Record<string, unknown>) {
    const lang = String(options.lang ?? '').toLowerCase();

    if (!['ts'].includes(lang)) return code;

    if (hasWrapMeta(options, 'wrap')) {
      return `type ${WRAP_TYPE} = {\n${code}\n}`;
    }

    if (hasWrapMeta(options, 'obj')) {
      return `const ${WRAP_OBJECT} = {\n${code}\n}`;
    }

    return code;
  },

  tokens(lines: Array<Array<any>>) {
    if (lines.length < 3) return lines;

    const firstLineText = lines[0].map((t) => t.content).join('');

    if (!firstLineText.includes(WRAP_TYPE) && !firstLineText.includes(WRAP_OBJECT)) return lines;

    return lines.slice(1, -1);
  },
} as any;
