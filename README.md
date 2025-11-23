# Funnies Mini App (Farcaster + Base)

Farcaster/Base Mini App that drops a random “Funnies” NFT to eligible FIDs (≤ 1,000,000) on Base.

## Onchain setup (contracts)
The `contracts/` folder is a Hardhat project with `FunniesAirdrop.sol`:
- ERC-721 (`Funnies Airdrop`, symbol `FUNNY`)
- Owner-only `safeMint(address to, string uri)` (matches the frontend ABI)
- One claim per address (tracked via mapping)

You’ll need a Base Sepolia RPC endpoint (e.g., from Alchemy/Ankr/QuickNode) and a deployer private key funded with Base Sepolia test ETH. Put them in `contracts/.env.contracts` (never commit secrets).

### Install deps
```bash
pnpm --dir contracts install
```

### Env for deployments
Create `.env.contracts` (or reuse `.env`) with:
```
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=your_private_key   # do NOT commit
```
Fill `contracts/.env.contracts` with your real values; keep the file local and out of git.

### Compile & deploy
```bash
pnpm compile:contracts
# Base mainnet
pnpm deploy:funnies:base
# Base Sepolia (testnet, recommended)
pnpm deploy:funnies:sepolia
```
The deploy script logs the address; copy it into `NEXT_PUBLIC_MINT_CONTRACT`.

## Frontend setup
Env vars (`.env.local`):
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org          # or Sepolia RPC for testing
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_MINT_CONTRACT=0xDeployedFunniesAirdropAddress
NEXT_PUBLIC_BASE_EXPLORER_URL=https://basescan.org         # swap to https://sepolia.basescan.org for testnet
```

Then:
```bash
pnpm install
pnpm dev
```

## Verify the Mini App flow
1) Open inside the Farcaster Mini App shell to load FID context + primary button.
2) Ensure user FID ≤ 1,000,000 (UI gates otherwise).
3) Connect wallet (Base), click mint. The app:
   - Picks a random URI from `lib/nfts.ts`.
   - Calls `safeMint(to, uri)` on the configured FunniesAirdrop contract.
   - Links to the tx using `NEXT_PUBLIC_BASE_EXPLORER_URL`.

NFT image/metadata URLs in `lib/nfts.ts` are placeholders—swap them for your final IPFS/HTTPS JPEG URIs.***
