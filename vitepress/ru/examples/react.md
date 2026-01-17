# Пример для React

Необходимо загрузить папку с примером из репозитория и установить зависимости:

```shell
npx degit dkazakov8/reactive-route/examples/react react-example
cd react-example
npm install
```

Затем выберите режим и систему реактивности для запуска:

- `npm run mobx` — CSR (только клиентский рендеринг) для MobX
- `npm run observable` — CSR (только клиентский рендеринг) для Observable
- `npm run ssr-mobx` — SSR для MobX
- `npm run ssr-observable` — SSR для Observable

Обратите внимание, что в этом примере оборачивание компонентов в `observer` выполняется сборщиком ESBuild. 
В собственных проектах не забудьте следовать соответствующему руководству по [интеграции](/ru/guide/react).
