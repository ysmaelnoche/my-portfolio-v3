# Plane — Ysmael Noche's portfolio

A portfolio laid out as an infinite canvas: frames for the intro, about, each project, stack and contact sit on a dotted plane you can drag, zoom and tour with the keyboard or a small command line. Built from the **Plane** concept in Claude Design.

Built with Next.js (App Router, fully static), React and TypeScript. It deploys to Vercel with no configuration.

## Editing the content

Everything on the site comes from **`src/content/portfolio.ts`**:

| Field | Where it shows |
| --- | --- |
| `name`, `role`, `location`, `intro` | Intro frame, page title, search/social descriptions, share image |
| `handle` | The `~/handle` paths on frames and in the top bar |
| `bio`, `timeline` | About frame |
| `projects` | One frame each. `id` becomes the deep link (`/#halcyon`) and `open halcyon` |
| `projects[].image` | Optional screenshot; put the file in `public/` (4:3 works best) |
| `projects[].links` | Optional links on the card (live site, source…) |
| `skills` | Stack frame; each item can be hovered or clicked to highlight projects that use it |
| `email`, `availability`, `links` | Contact frame. Links starting with `https://` open in a new tab |
| `hints` | Which examples the intro and command bar suggest (`open atlas`, `grep rust`) |

Project names in `stack` should match the names in `skills` so `grep` can find them (tools that only appear in a project stack are still searchable).

Any number of projects works: the first half go down the right side of the plane, the rest up the left. In development, the console warns if content grows long enough for frames to overlap.

## Using the site

- **Drag** to pan, **scroll** to pan, **⌘/Ctrl + scroll** or **pinch** to zoom
- **← / →** tour the frames, **1–9** jump, **0** fits everything, **+ / −** zoom
- **/** or **⌘K** opens the command bar: `tour`, `open <frame>`, `grep <tool>`, `clear`, `fit`, `read`, `invert`, `copy email`, `help`
- **r** switches to the reading view (a plain scrolling page), **i** toggles light/dark, **?** lists everything

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
- **Mobile and touch.** Pinch to zoom, two-finger pan, a tidier top bar, and a command bar that respects the iPhone home indicator. The concept switcher from the design file is gone.
- **Accessibility.** Real buttons and links, keyboard focus that flies the camera to the focused frame, a proper command-bar combobox, screen-reader announcements, a skip link, reduced-motion support (no boot sequence or flights), and higher contrast for small grey text.
- **Content.** Project cards show the role, status and the two headline facts from the data, and support optional screenshots and links. The Stack frame's items can be clicked to pin a highlight, and `grep` also finds tools that only appear in project stacks.
- **Deep links.** The URL follows the active frame (`/#parallax`), so any frame can be shared.
- **Theme.** Light mode uses colour tokens instead of a CSS invert filter, so images keep their colours; the choice is remembered.
- **Performance.** The camera only renders while something moves (the design ran an animation loop every frame), fonts are self-hosted, and the page is prerendered as static HTML.
- **SEO and sharing.** Title, description, Open Graph and Twitter tags, a generated share image, `sitemap.xml`, `robots.txt`, structured data (`Person`), an icon and a 404 page.
