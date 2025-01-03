# Seahorse Sports Worker

A Cloudflare Worker service that manages user points and leaderboards for sports-related activities. Built with TypeScript and Cloudflare's D1 database.

## Features

- User points management system
- Points approval tracking
- Leaderboard functionality with snapshot support
- HTML rendering for leaderboard display

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment:
   - Ensure you have a Cloudflare account
   - Authenticate with Wrangler: `wrangler login`

## Database

The project uses Cloudflare D1 with the following schema:

- **Users**: Stores user information and points
- **Approvals**: Tracks point approval history
- **Leaderboard Snapshots**: Maintains historical leaderboard data

### Database Commands

Deploy schema to local D1:
```bash
pnpm run deploy:sql:local
```

Deploy schema to production D1:
```bash
pnpm run deploy:sql:remote
```

## Development

Run the worker locally:
```bash
pnpm run dev
```

Type check the project:
```bash
pnpm run check
```

Generate types for the worker:
```bash
pnpm run types
```

## Deployment

1. Check deployment configuration:
```bash
pnpm run check
```

2. Deploy to Cloudflare:
```bash
pnpm run deploy
```

## Configuration

The worker is configured via `wrangler.json`:
- Uses D1 database: `seahorse-sports-dev`
- Includes source map uploads
- Observability enabled for monitoring

## Project Structure

```
├── src/
│   ├── index.ts        # Main worker entry point
│   └── renderHtml.ts   # HTML rendering utilities
├── schema.sql          # Database schema
├── wrangler.json       # Worker configuration
└── tsconfig.json       # TypeScript configuration
```
