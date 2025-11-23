// Minimal ERC721 URI-storage style mint ABI.
export const nftAbi = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "safeMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getMinted",
    outputs: [
      { internalType: "bool", name: "claimed", type: "bool" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
