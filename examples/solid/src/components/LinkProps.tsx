import { TypePayload } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeConfigsProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeConfigsProject>(
  props: TypePayload<TypeConfigsProject, TName> & {
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
    } as TypePayload<TypeConfigsProject, TName>;
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
