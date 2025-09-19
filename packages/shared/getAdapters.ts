import { adapters as adaptersKrObservable } from '../adapters/kr-observable';
import { adapters as adaptersKrObservablePreact } from '../adapters/kr-observable-preact';
import { adapters as adaptersMobx } from '../adapters/mobx';
import { adapters as adaptersMobxPreact } from '../adapters/mobx-preact';
import { adapters as adaptersMobxSolid } from '../adapters/mobx-solid';
import { adapters as adaptersSolid } from '../adapters/solid';
import { TypeAdapters } from '../core';
import { TypeOptions } from './types';

export function getAdapters(options: TypeOptions) {
  let adapters = {} as TypeAdapters;
  if (options.reactivity === 'mobx') {
    if (options.renderer === 'react') adapters = adaptersMobx;
    if (options.renderer === 'preact') adapters = adaptersMobxPreact;
    if (options.renderer === 'solid') adapters = adaptersMobxSolid;
  }
  if (options.reactivity === 'solid') adapters = adaptersSolid;
  if (options.reactivity === 'kr-observable') {
    if (options.renderer === 'react') adapters = adaptersKrObservable;
    if (options.renderer === 'preact') adapters = adaptersKrObservablePreact;
    if (options.renderer === 'solid') adapters = adaptersSolid;
  }

  return adapters;
}
