export const isClient = typeof window !== 'undefined';

export class PreventError extends Error {}

export class RedirectError extends Error {}
