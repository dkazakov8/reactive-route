export class PreventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PreventError';
  }
}
