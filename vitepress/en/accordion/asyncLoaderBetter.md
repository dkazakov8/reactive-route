Async imports are supported by all modern bundlers, allowing code to be split into chunks (code-splitting). 

It is also a powerful tool for modular
architectures, where an import returns not only `default: Component`, but also page-level
stores / APIs / other module services, and **Reactive Route** allows you to work with them.

Chunk files are loaded in an optimized way — only after all checks and lifecycle steps have passed,
and if necessary they can be preloaded manually via <Link to="api#router-preloadcomponent">
router.preloadComponent</Link>.

It also eliminates the possibility of cyclic imports that can break the application:

<!-- @include: @shared/introduction/defineRoutesCycleImportsLibraries.md -->
