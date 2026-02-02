<table><thead><tr><th>
Свойство</th><th>
Тип</th><th>
Описание</th></tr></thead><tbody><tr>

<td><b>
path
</b></td><td class="table-td">

```ts
string
```

</td><td>
Путь маршрута, должен начинаться с <code>/</code> и может включать динамические сегменты
</td></tr><tr>

<td><b>
loader
</b></td><td class="table-td">

```ts
() => Promise<{
  default: PageComponent,
  ...otherExports
}>
```

</td><td>
Функция, возвращающая Promise с компонентом в параметре <strong>default</strong>
</td></tr><tr>
<td><b>
props?
</b></td><td class="table-td">

```ts
Record<string, any>
```

</td><td>
Статичные props, передаваемые в компонент страницы
</td></tr><tr>
<td><b>
params?
</b></td><td class="table-td">

```ts
Record<
  TypeExtractParams<TPath>,
  (value: string) => boolean
>
```

</td><td>
Валидаторы для динамических сегментов path
</td></tr><tr>
<td><b>
query?
</b></td><td class="table-td">

```ts
Record<
  string,
  (value: string) => boolean
>
```

</td><td>
Валидаторы для query параметров
</td></tr><tr>
<td><b>
beforeEnter?
</b></td><td class="table-td">

```ts
(data: TypeLifecycleConfig) => 
  Promise<void>
```

</td><td>
Функция жизненного цикла, вызываемая перед редиректом на страницу
</td></tr><tr>
<td><b>
beforeLeave?
</b></td><td class="table-td">

```ts
(data: TypeLifecycleConfig) => 
  Promise<void>
```

</td><td>
Функция жизненного цикла, вызываемая перед уходом со страницы
</td></tr>
</tbody></table>