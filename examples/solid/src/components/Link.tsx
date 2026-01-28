import { TypePayload } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeRoutesProject, useRouter } from '../router';

export function Link<TName extends keyof TypeRoutesProject>(props: {
  payload: TypePayload<TypeRoutesProject, TName>;
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
