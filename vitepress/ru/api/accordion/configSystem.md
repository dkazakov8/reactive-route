Автоматически добавляются библиотекой и не могут быть указаны вручную.

<table><thead><tr><th>
Свойство</th><th>
Тип</th><th>
Описание</th></tr></thead><tbody>

<tr>

<td><b>name</b></td>

<td class="table-td">

```ts
string
```

</td><td>

Соответствует ключу объекта

</td></tr>

<tr>

<td><b>component?</b></td><td class="table-td">

```ts
any
```

</td><td>
Поле <code>default</code>, возвращенное <code>loader</code>
</td>

</tr>

<tr>

<td><b>otherExports?</b></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>

Все экспорты, возвращенные <code>loader</code>, кроме <code>default</code>

</td>
</tr>

</tbody>
</table>