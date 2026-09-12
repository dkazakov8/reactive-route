import type { TypeStateDynamic } from 'reactive-route';
import { createMemo } from 'solid-js';

import { type TypeConfigsProject, useRouter } from '../router';

export function Link<TName extends keyof TypeConfigsProject>(props: {
  to: TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  class?: string;
  children?: any;
}) {
  const { router } = useRouter();

  const url = createMemo(() => router.stateToUrl(props.to));

  return (
    <a
      href={url()}
      class={props.class}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.to);
      }}
    >
      {props.children}
    </a>
  );
}
