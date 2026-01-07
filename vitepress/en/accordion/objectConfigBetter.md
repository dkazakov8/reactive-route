<!-- @include: @shared/introduction/defineRoutesArrayLibraries.md -->

In routing libraries, configuration is often passed as an array, which creates the possibility of
`name` collisions, and TypeScript cannot guarantee their uniqueness.

**Reactive Route** automatically adds `name` to `Config`, equal to the object key, thus
providing unique keys, named routes, and the absence of collisions even before the code runs.

The library also minimizes boilerplate — there is no need to call a separate function for each
`Config`:

<!-- @include: @shared/introduction/defineRoutesBoilerplateLibraries.md -->
