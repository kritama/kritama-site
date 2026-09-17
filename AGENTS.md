## Git Flow

This repo uses git flow (`git-flow` CLI):

- `main` — production, deployed to krytama.com via Workers Builds; releases are tagged `vX.Y.Z`
- `develop` — integration branch, day-to-day work
- `feature/*`, `release/*`, `hotfix/*` — supporting branches (feature/release branch off `develop`; hotfix off `main`)

Releasing:

```
git flow release start X.Y.Z
GIT_EDITOR=true git flow release finish X.Y.Z
git push origin main develop && git push origin vX.Y.Z
```

Note: `git flow release finish -m "..."` is broken on macOS (BSD getopt); use `GIT_EDITOR=true` and create the tag separately if a custom tag message is needed.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
