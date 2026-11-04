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
npm run dev              # Studio dev server
npm run typecheck        # TypeScript
npm run schema:validate  # schema checks
npm run build            # what CI runs (.github/workflows/ci.yml)
npm run deploy           # deploy to n8builds.sanity.studio
```

CI type-checks, validates the schema and builds every pull request.
Dependabot opens one weekly pull request for all Sanity packages.

## Why standalone (not embedded in n8builds-web)

We tried embedding this Studio into `n8builds-web` at `/studio` (to make it one
repo). It **does not build on Next.js 16** yet: `sanity` v6 / `next-sanity` 13 fail
to resolve `rxjs` named exports (`catchError`, `share`, `takeUntil`, …) under
**both webpack and Turbopack**. `next-sanity` 13 *declares* Next 16 support, so
this is a known lag that should get patched.

**Revisit the embed once Sanity bundles cleanly on Next 16** (it builds fine on
Next 15 — which is what `portfolio-rank` runs). Until then, author here / at
n8builds.sanity.studio; nothing about the live blog depends on the embed.

## Live status (the "Go live" switch)

**Live status** sits at the top of the Studio's content list.
It is a single document that tells n8builds.dev you're streaming.

- Switch **Live now** on, pick the platform (X, Twitch, YouTube or Other), optionally add the link and a title, and **Publish**.
- Switch it off and publish when you stop; it also counts as off 12 hours after it was switched on (**Started at** is stamped automatically).
- While it's on, the site shows its corner player (a card with "Watch on X" for X), the navbar live dot and the `n8builds.dev/live` redirect, within about a minute.
- It is the only way the site knows about X streams, and it overrides the automatic Twitch and YouTube checks if they miss one.
- Only published changes count: the site reads the public dataset, which never includes drafts.

## Preview (drafts on the real site)

Every post has a **Preview** button next to **Publish**.
It opens the post on n8builds.dev as it is right now, unpublished changes included, with a "Preview. Drafts are showing." bar and an **Exit preview** button.

- It works for posts that were never published too.
- The link carries a secret that lasts an hour and only a signed-in Studio user can make, so a preview link can't be guessed; nothing in a preview is cached or indexed.
- To preview on a local copy of the site instead: `SANITY_STUDIO_PREVIEW_URL=http://localhost:3737 npm run dev`.
- How the site checks it: `docs/SANITY.md` in n8builds-web.
