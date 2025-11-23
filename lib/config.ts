import { createConfig, http } from "wagmi"
import { injected } from "wagmi/connectors"
import { base } from "wagmi/chains"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"

const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC_URL

if (!baseRpc) {
  // eslint-disable-next-line no-console
  console.warn("Missing NEXT_PUBLIC_BASE_RPC_URL; wagmi config will use default Base RPC.")
}

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(baseRpc),
  },
  connectors: [
    // Preferred inside the Farcaster Mini App shell per Mini App wallet guide.
    farcasterMiniApp(),
    // Fallback for local browser usage.
    injected({ shimDisconnect: true }),
  ],
  // In a real app with SSR, you'd handle this differently
  ssr: true,
})
