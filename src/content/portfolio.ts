import type { Portfolio } from './types';

/**
 * All site content lives here. Edit this file to update the portfolio;
 * layout, commands, SEO metadata and the share image are derived from it.
 */
export const portfolio: Portfolio = {
  name: 'Ysmael Noche',
  handle: 'ysmael',
  role: 'Software Engineer',
  location: 'Remote · GMT+8',
  email: 'hello@ysmaelnoche.dev',
  intro:
    'I design and engineer software interfaces — realtime tools, GPU graphics, and the quiet systems underneath them.',
  bio: [
    'I build software where the interface and the infrastructure are the same problem. Most of my work sits between design and systems engineering: collaborative tools, graphics on the GPU, and the pipelines that keep them fast.',
    'I care about latency you can feel, motion that explains, and code the next person can read. Currently taking on a small number of product and tooling engagements.',
  ],
  availability: 'Open to select engagements — Q4 2026',
  projects: [
    {
      id: 'halcyon',
      name: 'Halcyon',
      year: '2026',
      kind: 'Realtime collaboration engine',
      role: 'Lead engineer',
      status: 'In production',
      stack: ['TypeScript', 'Rust', 'WebSockets', 'React', 'Framer Motion'],
      description:
        'A multiplayer canvas engine that keeps hundreds of live cursors in sync. Conflict-free by design, offline by default, and small enough to embed anywhere.',
      facts: [
        { label: 'p95 sync latency', value: '38ms' },
        { label: 'Concurrent peers', value: '200+' },
      ],
    },
    {
      id: 'parallax',
      name: 'Parallax',
      year: '2025',
      kind: 'GPU charting library',
      role: 'Author & maintainer',
      status: 'Open source',
      stack: ['WebGL2', 'GLSL', 'TypeScript', 'Canvas'],
      description:
        'An open-source charting library that draws a million points at 60fps by moving layout, culling and hit-testing onto the GPU.',
      facts: [
        { label: 'Points at 60fps', value: '1M' },
        { label: 'GitHub stars', value: '4.1k' },
      ],
    },
    {
      id: 'ferrous',
      name: 'Ferrous',
      year: '2025',
      kind: 'Incremental build runner',
      role: 'Creator',
      status: 'Open source',
      stack: ['Rust', 'Redis', 'Node.js'],
      description:
        'A build orchestrator with a content-addressed cache shared across machines. Cold builds become warm ones; CI stops being the bottleneck.',
      facts: [
        { label: 'Faster CI', value: '6.2×' },
        { label: 'Teams using it', value: '40+' },
      ],
    },
    {
      id: 'tidal',
      name: 'Tidal',
      year: '2024',
      kind: 'Offline-first finance app',
      role: 'Frontend lead',
      status: 'Shipped',
      stack: ['React Native', 'TypeScript', 'Postgres'],
      description:
        'A personal finance app where every gesture is interruptible and every screen works underground. Sync resolves quietly when the signal returns.',
      facts: [
        { label: 'Store rating', value: '4.8' },
        { label: 'Monthly users', value: '120k' },
      ],
    },
    {
      id: 'atlas',
      name: 'Atlas',
      year: '2023',
      kind: 'Fleet operations dashboard',
      role: 'Full-stack engineer',
      status: 'Shipped',
      stack: ['Next.js', 'Postgres', 'WebGL2', 'Node.js', 'Three.js'],
      description:
        'A live geospatial console for a fleet of 3,000 vehicles — streamed positions, route replay, and anomaly alerts in a single map view.',
      facts: [
        { label: 'Vehicles tracked', value: '3,000' },
        { label: 'Update interval', value: '1s' },
      ],
    },
    {
      id: 'loom',
      name: 'Loom',
      year: '2023',
      kind: 'Design token pipeline',
      role: 'Systems engineer',
      status: 'Internal tool',
      stack: ['TypeScript', 'Node.js', 'Figma', 'React', 'Design systems'],
      description:
        'A token compiler that turns one design decision into code for six platforms, with visual diffs on every pull request.',
      facts: [
        { label: 'Platforms', value: '6' },
        { label: 'Tokens managed', value: '1,400' },
      ],
    },
  ],
  skills: [
    { group: 'Interface', items: ['React', 'Next.js', 'TypeScript', 'React Native', 'Framer Motion'] },
    { group: 'Graphics', items: ['WebGL2', 'Three.js', 'GLSL', 'Canvas'] },
    { group: 'Systems', items: ['Node.js', 'Rust', 'Postgres', 'Redis', 'WebSockets'] },
    { group: 'Craft', items: ['Figma', 'Design systems', 'Accessibility', 'Performance'] },
  ],
  timeline: [
    { years: '2024 — Now', role: 'Independent engineer', org: 'Product & tooling engagements' },
    { years: '2021 — 2024', role: 'Frontend lead', org: 'Fintech product team' },
    { years: '2019 — 2021', role: 'Software engineer', org: 'Logistics platform' },
    { years: '2015 — 2019', role: 'B.S. Computer Science', org: 'University' },
  ],
  links: [
    { label: 'GitHub', handle: '@ysmaelnoche', href: '#' },
    { label: 'LinkedIn', handle: 'in/ysmaelnoche', href: '#' },
    { label: 'Read.cv', handle: 'ysmael', href: '#' },
    { label: 'Résumé', handle: 'PDF · 120kb', href: '#' },
  ],
  hints: { open: 'atlas', grep: 'rust' },
};
