export const menuContracts = {
  win: "0x41053FCD8cBca4690c27beE76FE7971eF860A5f3",
  draw: "0xb0f994ed6a970d659b3522e5926f19165c7e31e6",
  loose: "0x6937b0c71da9cba45cf88beabb6f3bdca3a410da",
} as const

import { parseAbi } from "viem"

export const menuAbi = parseAbi([
  "function win() external payable",
  "function draw() external payable",
  "function loose() external payable",
])
