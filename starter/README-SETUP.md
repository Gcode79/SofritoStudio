# Sofrito Studio OpenCode Starter

This is a ready-to-copy operating layer for an existing Sofrito Studio repository.

## Install

Copy these into the root of your existing repo:

- `AGENTS.md`
- `opencode.jsonc`
- `.opencode/agents/*`
- `docs/*`
- the empty directories as desired

If your existing repository already has `AGENTS.md` or `opencode.jsonc`, merge carefully rather than overwriting.

## First OpenCode session

1. Start OpenCode from the repository root.
2. Ask the build agent to inspect the existing application without editing.
3. Have it map the current routes, components, deployment config, package scripts, and integrations.
4. Ask the reviewer agent to identify risks.
5. Only then begin migration/refactoring.

## Recommended first prompt

"Audit this repository against AGENTS.md. Do not edit anything. Map the current stack, deployment flow, Gumroad integration, analytics, email automation, and major conversion paths. Identify the top 10 technical and business risks, then propose a phased plan. Prefer preserving working code over rewriting it."

## Important

This starter does not assume your exact framework. Keep your existing framework unless there is a strong reason to migrate.
