import type { TypeStateDynamic } from 'reactive-route';

import { type TypeConfigsProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeConfigsProject>(
  props: TypeStateDynamic<TypeConfigsProject, TName> & {
    className?: string;
    children?: any;
    replace?: boolean;
  }
) {
  const { router } = useRouter();

  const stateDynamic = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
    replace: props.replace,
  } as TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };

  const url = router.stateToUrl(stateDynamic);

  return (
    <a
      href={url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(stateDynamic);
      }}
    >
      {props.children}
    </a>
  );
}
