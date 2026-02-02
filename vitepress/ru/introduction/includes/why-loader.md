
- Это позволяет использовать встроенный в любой современный бандлер
  code-splitting
- Добавляется мощный механизм для управления модульной архитектурой, ведь
  `loader` может возвращать не только компонент, но и любые данные. Например,
  постраничные сторы или апи, и для них тоже будет работать code-splitting
- Решается проблема циклических зависимостей, характерная для многих
  роутеров, когда конфигурация импортирует компонент, а компонент в свою
  очередь импортирует конфигурацию. При изменении порядка импортов все может
  легко сломаться

```tsx
// mobx-router

// imports component in configs
import { Home } from 'components/Home';

export const configs = {
  home: new Route<RootStore>({
    path: '/',
    component: <Home />
  })
}

// imports configs in component
import { configs } from '../configs';

export const Home = observer(() => {
  const store = useContext(StoreContext);
  const { router: { goTo } } = store;

  return <Link router={store.router} route={configs.gallery} />
});
```

- Файлы загружаются только 1 раз, при последующем переходе на этот `Config`
  все берется из кеша
- При необходимости можно вручную предзагрузить чанки через `router.preloadComponent`
