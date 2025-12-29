export class PreventError extends Error {
  constructor(message: string) {
    super(message);

    /* v8 ignore next -- @preserve */
    this.name = 'PreventError';
  }
}
