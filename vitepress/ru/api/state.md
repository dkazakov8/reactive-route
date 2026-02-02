# State

Общее назначение изложено в разделе <Link to="guide/core-concepts">Основные структуры</Link>.

## Свойства

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>name</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Соответствует ключу объекта</td>
</tr><tr>
<td><code>params</code></td>
<td class="table-td">

```ts
Record<
  keyof TConfig['params'], 
  string
>
```

</td>
<td>Проверенные и декодированные значения params. Все ключи, которые описаны в валидаторах <code>Config</code> будут присутствовать</td>
</tr><tr>
<td><code>query</code></td>
<td class="table-td">

```ts
Partial<Record<
  keyof TConfig['query'], 
  string
>>
```

</td>
<td>Проверенные и декодированные значения query. Все опциональны</td>
</tr><tr>
<td><code>pathname</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированный pathname</td>
</tr><tr>
<td><code>search</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированный search</td>
</tr><tr>
<td><code>url</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированный <code>${pathname}?${search}</code></td>
</tr><tr>
<td><code>isActive</code></td>
<td class="table-td">

```ts
boolean
```

</td>
<td>Указывает, что компонент страницы этого <code>State</code> отрендерен или будет отрендерен в следующем тике</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
TConfig['props']
```

</td>
<td>Статичный объект из <code>Config</code></td>
</tr></tbody>
</table>

## Типы

### TypeState

<<< @/../packages/core/types.ts#type-state{typescript}
