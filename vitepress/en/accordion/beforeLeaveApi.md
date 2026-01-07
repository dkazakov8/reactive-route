<table><tbody><tr>
<td class="table-td">

```ts wrap
reason: 
  | 'new_query' 
  | 'new_params' 
  | 'new_config'
```

</td>
<td>Reason why <code>beforeLeave</code> was called. If both params and query changed, then <code>new_params</code></td>
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
currentState: TypeStateUntyped
```

</td>
<td>Current active <code>State</code></td>
</tr><tr>
</tr><tr>
<td class="table-td">

```ts wrap
preventRedirect: () => void
```

</td>
<td>Method for stopping the redirect</td>
</tr>

</tbody></table>

