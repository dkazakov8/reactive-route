::: code-group
```tsx [React + MobX]
import { autorun } from 'mobx'

function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;
  
  useEffect(() => {
    const disposer = autorun(() => {
      console.log(routeState.params.id, routeState.query.phone);
    })

    return () => disposer();
  }, []);
}
```
```tsx [Preact + Observable]
import { autorun } from 'kr-observable'

function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;
  
  useEffect(() => {
    const disposer = autorun(() => {
      console.log(routeState.params.id, routeState.query.phone);
    })

    return () => disposer();
  }, []);
}
```
```tsx [Solid + Solid]
import { createRenderEffect } from 'solid-js'

function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;

  createRenderEffect(() => {
    console.log(routeState.params.id, routeState.query.phone);
  })
}
```
```vue [Vue + Vue]
<script lang="ts" setup>
  import { watchEffect } from 'vue';

  const { router } = useRouterStore();

  const routeState = router.state.user!;

  watchEffect(() => {
    console.log(routeState.params.id, routeState.query.phone);
  });
</script>
```
:::