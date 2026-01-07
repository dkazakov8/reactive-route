import { describe, it } from 'vitest';

import { checkStateCreation, untypedRouter, v } from './helpers/checkers';

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
    };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      // do not propagate malformed values further, replace '%2' with '%252'
      expectedUrl: `${pathname}${search.replace('%2', '%252')}`,
    });
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
    };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      // do not propagate malformed values further, replace '%2' with '%252'
      expectedUrl: `${pathname.replace('%2', '%252')}${search}`,
    });
  });
});
