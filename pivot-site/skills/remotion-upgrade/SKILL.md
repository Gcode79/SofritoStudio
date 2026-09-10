# Remotion — Upgrade (Sofrito Studio)

Upgrade Remotion (and related packages) in the pivot-site video project.

## When to use

- The user asks to update/patch Remotion or dependencies.
- A compatible-version or Mediabunny mismatch is suspected.

## Step 1 — Inspect the project

Identify the package manager (npm/pnpm/yarn/bun) and workspaces from the
package manifest and lockfile at `pivot-site/`. Preserve unrelated changes;
upgrade only what is required.

## Step 2 — Upgrade with the CLI (preferred)

If `@remotion/cli` is locally available:

```bash
npx remotion upgrade
```

This also updates project-local Remotion skills. Skip the manual steps below.

## Step 3 — Manual upgrade

If the CLI is unavailable:

1. Get the latest stable version: `npm view remotion version`.
2. Upgrade every installed `remotion` and `@remotion/*` package to that exact
   version (keep each dependency section and the project's workspace/catalog
   conventions).
3. Read the [Mediabunny compatibility page](https://www.remotion.dev/docs/mediabunny/version)
   and upgrade every `mediabunny` / `@mediabunny/*` package to the documented
   compatible version for the target Remotion version.
4. Run the package manager lockfile update.
5. If project-local skills are managed by `npx skills`, refresh them:
   `npx skills update remotion-best-practices remotion-captions remotion-create remotion-docs remotion-interactivity remotion-maps remotion-markup remotion-multimedia remotion-render remotion-saas remotion-studio remotion-upgrade --yes`

## Step 4 — Verify

- Review the manifest and lockfile diff: all Remotion packages on one exact
  version; all Mediabunny packages on the compatible version.
- If the CLI is available, run `npx remotion versions` as a final check.
- Do a smoke render (`remotion-render`) of one composition and a Studio
  preview (`remotion-studio`) before relying on the new version.

## Sofrito Studio notes

- This branded pack is adapted from the global `remotion-*` skills. After an
  upgrade, re-run the global skill update, diff the new guidance against this
  pack, and reconcile (never silently diverge from brand rules).
- Keep composition IDs and `remotion.config.ts` intact; confirm `npx remotion`
  runs from the directory holding the config.
- Record the version change in `ops/decision-log.md` (decision memo) and
  `pivot-site/README.md` or the video project manifest as applicable.
- The upgrade itself is in-repo only. Deploying a changed video asset or
  shipping new content still requires founder approval; mark anything shared
  `DRAFT — AWAITING FOUNDER APPROVAL`.

## Reference

[Remotion releases](https://github.com/remotion-dev/remotion/releases) contain
the changelog and are useful for summarizing relevant changes after the
upgrade.