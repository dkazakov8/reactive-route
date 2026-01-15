# Состояние (State)

Основная идея изложена в разделе [Основные концепции](/ru/guide/core-concepts).

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
<td>Соответствует ключу объекта в конфигурации маршрутов</td>
</tr><tr>
<td><code>params</code></td>
<td class="table-td">

```ts
Record<string, string>
```

</td>
<td>Проверенные и декодированные значения параметров пути (params)</td>
</tr><tr>
<td><code>query</code></td>
<td class="table-td">

```ts
Record<string, string>
```

</td>
<td>Проверенные и декодированные значения параметров запроса (query)</td>
</tr><tr>
<td><code>pathname</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированная строка пути (pathname)</td>
</tr><tr>
<td><code>search</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированная строка параметров запроса (search)</td>
</tr><tr>
<td><code>url</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированная строка вида <code>${pathname}?${search}</code></td>
</tr><tr>
<td><code>isActive</code></td>
<td class="table-td">

```ts
boolean
```

</td>
<td>Индикатор того, что соответствующий компонент страницы отрендерен или будет отрендерен в следующем тике</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Статические пропсы из <code>Config</code></td>
</tr></tbody>
</table>

