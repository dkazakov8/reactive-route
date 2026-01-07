<table><tbody><tr>
<td class="table-td">

```ts wrap
reason: 
  | 'new_query' 
  | 'new_params' 
  | 'new_config'
```

</td>
<td>Причина, по которой вызван <code>beforeEnter</code>. Если изменились и params и query, то <code>new_params</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
nextState: TypeStateUntyped
```

</td>
<td>Следующий предполагаемый <code>State</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
currentState?: TypeStateUntyped
```

</td>
<td>Текущий активный <code>State</code> (<code>undefined</code> при самом первом редиректе)</td>
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
<td>Метод для редиректа внутри жизненного цикла. Так как <code>createConfigs</code> вызывается до создания роутера, здесь не получится использовать <code>router.redirect</code></td>
  </tr></tbody>
</table>
