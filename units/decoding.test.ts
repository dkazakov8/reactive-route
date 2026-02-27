import { describe, it } from 'vitest';

import { checkStateFromPayload, checkURLPayload, untypedRouter, v } from './helpers/checkers';

describe(`URL decoding`, async () => {
  it('Decodes query', () => {
    const router = untypedRouter({
      home: {
        path: '/',
        query: {
          0: v.length,
          1: v.length,
          2: v.length,
          3: v.length,
          4: v.length,
          5: v.length,
          6: v.length,
        },
      },
    });

    const payload = {
      name: 'home',
      params: {},
      query: {
        0: 'шеллы',
        1: '?x=test',
        2: 'malformed%2',
        3: 'foo\0bar',
        4: '../../etc/passwd',
        5: 'with space-and&symbols',
        6: 'malformed%2',
      },
    } as any;
    const pathname = '/';
    const search =
      '?' +
      '0=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B' +
      '&' +
      '1=%3Fx%3Dtest' +
      '&' +
      '2=malformed%2' +
      '&' +
      '3=foo%00bar' +
      '&' +
      '4=..%2F..%2Fetc%2Fpasswd' +
      '&' +
      '5=with%20space-and%26symbols' +
      '&' +
      '6=malformed%252';

    const state = {
      ...payload,
      // do not propagate malformed values further, replace '%2' with '%252'
      url: `${pathname}${search.replace('%2', '%252')}`,
      search: `${search.slice(1).replace('%2', '%252')}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });

  it('Decodes params', () => {
    const router = untypedRouter({
      home: {
        path: '/:0/:1/:2/:3/:4/:5/:6',
        params: {
          0: v.length,
          1: v.length,
          2: v.length,
          3: v.length,
          4: v.length,
          5: v.length,
          6: v.length,
        },
      },
    });

    const payload = {
      name: 'home',
      params: {
        0: 'шеллы',
        1: '?x=test',
        2: 'malformed%2',
        3: 'foo\0bar',
        4: '../../etc/passwd',
        5: 'with space-and&symbols',
        6: 'malformed%2',
      },
      query: {},
    } as any;
    const pathname =
      '/' +
      '%D1%88%D0%B5%D0%BB%D0%BB%D1%8B' +
      '/' +
      '%3Fx%3Dtest' +
      '/' +
      'malformed%2' +
      '/' +
      'foo%00bar' +
      '/' +
      '..%2F..%2Fetc%2Fpasswd' +
      '/' +
      'with%20space-and%26symbols' +
      '/' +
      'malformed%252';
    const search = '';

    const state = {
      ...payload,
      // do not propagate malformed values further, replace '%2' with '%252'
      url: `${pathname.replace('%2', '%252')}${search}`,
      search: `${search.slice(1)}`,
      pathname: pathname.replace('%2', '%252'),
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });
});
