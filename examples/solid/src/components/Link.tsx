import { TypePayload } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeConfigsProject, useRouter } from '../router';

export function Link<TName extends keyof TypeConfigsProject>(props: {
  payload: TypePayload<TypeConfigsProject, TName>;
  class?: string;
  children?: any;
}) {
  const { router } = useRouter();

  const state = createMemo(() => router.payloadToState(props.payload));

  return (
    <a
      href={state().url}
      class={props.class}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.payload);
      }}
    >
      {props.children}
    </a>
  );
}
