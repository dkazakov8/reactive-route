# Contributing

## Commit messages

This repository uses Conventional Commits and `release-please` with the `node` release type.
Use commit messages in this format:

```text
type: short summary
```

Do not use scopes for this repository.

## Types that affect releases

- `feat:` new user-facing functionality, usually triggers a `minor` release
- `fix:` bug fix, usually triggers a `patch` release
- `deps:` dependency update, usually triggers a `patch` release

## Types that usually do not affect releases

- `chore:` maintenance tasks and internal cleanup
- `docs:` documentation-only changes
- `test:` test-only changes
- `ci:` CI/CD changes
- `build:` build tooling changes
- `refactor:` internal refactoring without user-facing behavior changes
- `perf:` performance work without a user-facing feature
- `style:` formatting-only changes

## Breaking changes

If a change breaks public API or behavior, mark it as breaking:

```text
feat!: remove legacy router API
```

Breaking changes trigger a `major` release.
