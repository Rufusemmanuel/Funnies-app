import { createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"

export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  // In a real app with SSR, you'd handle this differently
  ssr: true,
})
