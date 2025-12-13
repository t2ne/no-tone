# no-tone

Source code for my personal website [**no-tone**](https://no-tone.com).

Built with [Astro](https://astro.build) and deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/).

## Tech stack

- Astro 5
- TypeScript
- Cloudflare Workers + Wrangler

## Project structure

Key folders and files:

```text
public/              Static assets
src/
	components/        Reusable layout + UI pieces
	pages/             Route pages (index, thoughts, etc.)
	styles/            Global CSS
astro.config.mjs     Astro configuration
wrangler.json        Cloudflare Workers configuration
tsconfig.json        TypeScript configuration
```

## Getting started

Prerequisites:

- Node.js and npm installed

Install dependencies:

```bash
npm install
```

Start the dev server (defaults to http://localhost:4321):

```bash
npm run dev
```

## Useful commands

All commands are run from the project root.

```bash
# Start local dev server
npm run dev

# Build for production
npm run build

# Preview the production build locally (Workers)
npm run preview

# Type check & dry-run deploy check
npm run check

# Deploy to Cloudflare Workers
npm run deploy

# Generate Cloudflare type definitions
npm run cf-typegen
```

## License

Personal site source; no formal license.
