export class RedirectError extends Error {
  constructor(message: string) {
    super(message);

    /* v8 ignore next -- @preserve */
    this.name = 'RedirectError';
  }
}
