# Plane — Ysmael Noche's portfolio

A portfolio laid out as an infinite canvas: frames for the intro, about, each project, stack and contact sit on a dotted plane you can drag, zoom and tour with the keyboard or a small command line. Built from the **Plane** concept in Claude Design.

Built with Next.js (App Router, fully static), React and TypeScript. It deploys to Vercel with no configuration.

## Editing the content

Everything on the site comes from **`src/content/portfolio.ts`** (types in `src/content/types.ts`):

| Field | Where it shows |
| --- | --- |
| `name`, `fullName`, `role`, `location`, `intro` | Intro frame, page title, search/social descriptions, share image, structured data |
| `handle` | The `~/handle` paths on frames and in the top bar |
| `bio`, `approach`, `timeline` | About frame |
| `projects` | One frame and one case study page (`/work/<id>`) each. `id` is also the deep link (`/#<id>`) and works with `open <id>` / `cat <id>` |
| `projects[].status` | `Implemented`, `Ongoing`, `In development`, `Planned` or `Conceptual`, plus an optional `statusNote` |
| `projects[].visual` | The diagram on the card: a `flow` of steps (with optional `planned` steps drawn dashed) or a `quadrant` |
| `projects[].sections` | The case study body: each has a `title` and any of `body` paragraphs, `items` bullets and a `flow` |
| `projects[].group` + `groups` | Projects that share a group (e.g. the internship) are listed together in one frame |
| `projects[].image`, `links` | Optional screenshot (put it in `public/`, 4:3 works best) and links on the card |
| `skills` | Stack frame; each tool can be hovered or clicked to highlight the projects that use it |
| `email`, `availability`, `links` | Contact frame. The email row stays hidden while `email` is empty; `#` links are hidden too |
| `hints` | Which examples the intro and command bar suggest (`open orbit`, `grep python`) |

Tool names in a project's `stack` should match the names in `skills` so `grep` counts them.

Any number of projects works: the first half of the work frames go down the right side of the plane, the rest up the left, and the stack and contact frames move down as their content grows. In development, the console warns if frames ever overlap.

**Accuracy:** the content follows a few rules — no invented metrics or results, statuses from the list above, planned features labelled as planned, and personal experiments kept apart from professional experience (the `Exploring` skill group).

## Using the site

- **Drag** to pan, **scroll** to pan, **⌘/Ctrl + scroll** or **pinch** to zoom
- **← / →** tour the frames, **1–9** jump, **0** fits everything, **+ / −** zoom
- **/** or **⌘K** opens the command bar: `tour`, `open <frame>`, `cat <project>` (case study), `grep <tool>`, `clear`, `fit`, `read`, `invert`, `copy email`, `help`
- **r** switches to the reading view (a plain scrolling page), **i** toggles light/dark, **?** lists everything
- Single-key shortcuts can be turned off in the help dialog (**?**)

## Development

Requires Node 20.9+ (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + unit tests
npm run build      # production build
```

## Deploying to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js, so there are no build settings to change.
2. Optional: once you have a custom domain, set `NEXT_PUBLIC_SITE_URL` (for example `https://ysmaelnoche.dev`) in the project's environment variables. It's used for canonical URLs, the sitemap and share images; without it the Vercel production URL is used.

## What changed from the design

The layout, type, colours, motion and commands follow the Claude Design file. On top of that:

- **Reading view.** A single-column version of the same content (`read`, **r**, or the top-bar button). Better on phones, and it's also what visitors without JavaScript see.
- **Mobile and touch.** Pinch to zoom, two-finger pan, drags that start on a link still pan, a compact layout for phones in portrait and landscape, readable zoom for wide frames, and a one-time suggestion to use the reading view. The concept switcher from the design file is gone.
- **Accessibility.** Real buttons and links; navigating moves keyboard focus to the frame; the header and frame list come first in tab order; a proper command-bar combobox; screen-reader announcements; a skip link; single-key shortcuts that can be switched off; reduced-motion support (no boot sequence or flights); AA contrast in both themes. Checked with axe in every view and theme.
- **Case studies.** Every project has its own static page (`/work/<id>`) with problem, solution, outcome and next steps, so each one can be shared and indexed. Cards show a diagram drawn from the project's own flow, its status and two headline facts.
- **Groups.** Smaller related projects (the internship) share one frame instead of crowding the plane.
- **Stack.** Tools can be clicked to pin a highlight, and `grep` also finds tools that only appear in project stacks.
- **Deep links.** The URL follows the active frame (`/#parallax`), so any frame can be shared.
- **Theme.** Light mode uses colour tokens instead of a CSS invert filter, so images keep their colours; the choice is remembered.
- **Performance.** The camera only renders while something moves (the design ran an animation loop every frame), fonts are self-hosted, and the page is prerendered as static HTML.
- **SEO and sharing.** Title, description, Open Graph and Twitter tags, a generated share image, `sitemap.xml`, `robots.txt`, structured data (`Person`), an icon and a 404 page.
