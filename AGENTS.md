<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

- All site content is in `src/content/portfolio.ts` (types in `src/content/types.ts`). Content edits should not need component changes.
- The canvas lives in `src/components/plane/`. Pure logic (`layout.ts`, `camera.ts`, `commands.ts`) is unit-tested; keep it free of React and DOM access.
- `layout.ts` must keep reproducing the original Plane coordinates for six projects — `layout.test.ts` pins them.
- Colours are CSS custom properties in `src/app/globals.css`; the light theme mirrors dark (its inverse, with a few greys tuned for contrast). Don't hard-code colours in components.
- The reading view and the no-JS fallback are the same CSS (`html[data-view='read']` / `html.no-js` in `plane.module.css`); check both when changing frame markup.
- Run `npm run check` (lint, typecheck, tests) and `npm run build` before committing.
