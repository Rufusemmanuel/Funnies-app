import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import * as dotenv from "dotenv"

// Load environment variables in order: local contracts env, root override (optional), default .env
dotenv.config({ path: ".env.contracts" })
dotenv.config({ path: "../.env.contracts" })
dotenv.config()

const {
  BASE_MAINNET_RPC_URL,
  BASE_SEPOLIA_RPC_URL,
  DEPLOYER_PRIVATE_KEY,
} = process.env

const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: BASE_MAINNET_RPC_URL || "",
      accounts,
      chainId: 8453,
    },
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "",
      accounts,
      chainId: 84532,
    },
  },
  etherscan: {
    // Users can set ETHERSCAN_API_KEY if they want verification later.
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
}

export default config
