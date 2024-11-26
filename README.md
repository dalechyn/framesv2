WIP

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

- `CUSTODY_WALLET_PRIVATE_KEY` (optional: needed if you don't set a static `.well-known/farcaster.json`) – your custody wallet private ley
- `CUSTODY_WALLET_FID` (optional: doesn't do a request to retrieve an FID) – FID held by your custody wallet
- `NEXT_PUBLIC_URL` (optional: needed if you don't use Vercel for deployments.) - Public url for your app.
