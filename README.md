# n8builds Studio

The **Sanity Studio** (content editor) for the N8builds blog ("N8 Notions").
A **standalone** Sanity Studio app — intentionally *not* part of the
`n8builds-web` website repo.

## What this is

- The authoring/admin UI where blog posts are written and edited.
- Backed by **Sanity project `abgyc32w`**, dataset `production`.
- Deployed (Sanity-hosted) at **https://n8builds.sanity.studio**.
- The public website (`n8builds-web`, route `/blog`) *reads* the same dataset and
  renders posts at **https://n8builds.dev/blog**.

So: **Studio = write · Sanity cloud = the shared store · n8builds-web = read.**

## Run locally

```bash
npm install
npm run dev      # Studio dev server
npm run deploy   # deploy to n8builds.sanity.studio
```

## Why standalone (not embedded in n8builds-web)

We tried embedding this Studio into `n8builds-web` at `/studio` (to make it one
repo). It **does not build on Next.js 16** yet: `sanity` v6 / `next-sanity` 13 fail
to resolve `rxjs` named exports (`catchError`, `share`, `takeUntil`, …) under
**both webpack and Turbopack**. `next-sanity` 13 *declares* Next 16 support, so
this is a known lag that should get patched.

**Revisit the embed once Sanity bundles cleanly on Next 16** (it builds fine on
Next 15 — which is what `portfolio-rank` runs). Until then, author here / at
n8builds.sanity.studio; nothing about the live blog depends on the embed.
