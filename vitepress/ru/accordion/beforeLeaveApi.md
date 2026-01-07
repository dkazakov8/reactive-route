<table><tbody><tr>
<td class="table-td">

```ts wrap
reason: 
  | 'new_query' 
  | 'new_params' 
  | 'new_config'
```

</td>
<td>Причина, по которой вызван <code>beforeLeave</code>. Если изменились и params и query, то <code>new_params</code></td>
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
currentState: TypeStateUntyped
```

</td>
<td>Текущий активный <code>State</code></td>
</tr><tr>
</tr><tr>
<td class="table-td">

```ts wrap
preventRedirect: () => void
```

</td>
<td>Метод для остановки редиректа</td>
</tr>

</tbody></table>
