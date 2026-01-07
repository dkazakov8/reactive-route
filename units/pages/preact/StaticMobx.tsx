// @ts-expect-error
import { observer } from 'mobx-preact';

export const store = '';
export const actions = '';

const Static = observer(() => {
  return 'Static';
});

export default Static;
