<table><tbody><tr>
<td class="table-td">

```ts wrap
name: string
```

</td>
<td>Соответствует ключу <code>Config</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
params: Record<
  keyof TConfig['params'], 
  string
>
```

</td>
<td>Проверенные и декодированные значения params. Все обязательно будут присутствовать</td>
</tr><tr>
<td class="table-td">

```ts wrap
query: Partial<Record<
  keyof TConfig['query'], 
  string
>>
```

</td>
<td>Проверенные и декодированные значения query. Все опциональны</td>
</tr></tbody>
</table>