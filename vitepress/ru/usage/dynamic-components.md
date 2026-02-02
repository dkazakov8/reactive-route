# Layout

## Реакции на изменения

Объект <Link to="api/router#router-state">router.state</Link> является **реактивным**, поэтому за изменениями
можно следить в реакциях, например:

<!-- @include: @shared/advanced/reactions.md -->


Существует три основных способа работы с динамическими компонентами:

1. Вне компонента Router, как описано в <Link to="api/router#router-getactivestate">router.getActiveState</Link>

2. Внутри компонента страницы, реагируя на динамические параметры

<!-- @include: @shared/advanced/dashboard.md -->

<!-- @include: @shared/advanced/dashboard-example.md -->

3. Также можно установить один и тот же `loader` для нескольких `Config`. В этом случае `beforeComponentChange` 
не будет вызываться, и компонент страницы **не** будет перерендериваться при редиректе между ними. 
Однако активный `State` будет меняться. Этот пример мог бы выглядеть как предыдущий, но выберем подход с реактивной функцией:

<!-- @include: @shared/advanced/dashboard-multi.md -->

<!-- @include: @shared/advanced/dashboard-multi-example.md -->

Эти три подхода решают немного разные задачи, но служат хорошим примером, как использовать Reactive Route в различных сценариях.