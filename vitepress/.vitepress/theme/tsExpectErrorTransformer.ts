const TS_EXPECT_ERROR_LINE_REGEXP = /^\s*\/\/\s*@ts-expect-error\b/;
const CODE_ERROR_MARKER = '// [!code error]';

export const tsExpectErrorTransformer = {
  name: 'ts-expect-error-transformer',

  preprocess(code: string, options: Record<string, unknown>) {
    const lang = String(options.lang ?? '').toLowerCase();

    if (!['ts', 'tsx'].includes(lang)) return code;

    return code
      .split('\n')
      .map((line) => {
        if (!TS_EXPECT_ERROR_LINE_REGEXP.test(line)) return line;
        if (line.includes(CODE_ERROR_MARKER)) return line;

        return `${CODE_ERROR_MARKER}\n${line}`;
      })
      .join('\n');
  },
} as any;
