<table><tbody><tr>
<td class="table-td">

```ts wrap
reason: 
  | 'new_query' 
  | 'new_params' 
  | 'new_config'
```

</td>
<td>Reason why <code>beforeEnter</code> was called. If both params and query changed, then <code>new_params</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
nextState: TypeStateUntyped
```

</td>
<td>Next expected <code>State</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
currentState?: TypeStateUntyped
```

</td>
<td>Current active <code>State</code> (<code>undefined</code> on the very first redirect)</td>
</tr><tr>
</tr><tr>
<td class="table-td">

```ts wrap
redirect: (
  stateDynamic: 
    TypeStateDynamicUntyped &
    { replace?: boolean; }
) => void
```

</td>
<td>Method for redirecting inside the lifecycle. Since <code>createConfigs</code> is called before the router is created, <code>router.redirect</code> cannot be used here</td>
  </tr></tbody>
</table>
