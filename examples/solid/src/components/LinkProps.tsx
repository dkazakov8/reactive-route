import { TypePayload } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeRoutesProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeRoutesProject>(
  props: TypePayload<TypeRoutesProject, TName> & {
    class?: string;
    children?: any;
  }
) {
  const { router } = useRouter();

  const payload = createMemo(() => {
    return {
      name: props.name,
      query: 'query' in props ? props.query : undefined,
      params: 'params' in props ? props.params : undefined,
    } as TypePayload<TypeRoutesProject, TName>;
  });

  const state = createMemo(() => router.payloadToState(payload()));

  return (
    <a
      href={state().url}
      class={props.class}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(payload());
      }}
    >
      {props.children}
    </a>
  );
}
