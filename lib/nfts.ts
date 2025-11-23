// IMPORTANT: Drop your 5 JPG images into:
// /public/images/funnies/1.jpg
// /public/images/funnies/2.jpg
// /public/images/funnies/3.jpg
// /public/images/funnies/4.jpg
// /public/images/funnies/5.jpg

export type FunniesNft = {
  id: number
  name: string
  description: string
  image: string
  localImageSrc?: string
  attributes: { trait_type: string; value: string }[]
  metadataUrl: string
}

const baseCid = "bafybeibj2vxi3ltkphcjrqcgumvdhdkrcaywm5r4xxeddzunjno2dc4tam"
const metadataCid = "bafybeibpev5llflnjbopyscz2bcsocdxokkvk6p5rcyig5osckfzcn2jpq"
const imageUrl = (file: string) => `ipfs://${baseCid}/${file}`
const metadataUrl = (file: string) => `ipfs://${metadataCid}/${file}`

export const NFT_VARIANTS: FunniesNft[] = [
  {
    id: 1,
    name: "Funnies #1",
    description: "Funnies NFT Variant 1",
    image: imageUrl("1.jpg"),
    localImageSrc: "/images/funnies/1.jpg",
    attributes: [
      { trait_type: "Variant", value: "1" },
      { trait_type: "Theme", value: "Playful" },
    ],
    metadataUrl: metadataUrl("1.json"),
  },
  {
    id: 2,
    name: "Funnies #2",
    description: "Funnies NFT Variant 2",
    image: imageUrl("2.jpg"),
    localImageSrc: "/images/funnies/2.jpg",
    attributes: [
      { trait_type: "Variant", value: "2" },
      { trait_type: "Theme", value: "Bright" },
    ],
    metadataUrl: metadataUrl("2.json"),
  },
  {
    id: 3,
    name: "Funnies #3",
    description: "Funnies NFT Variant 3",
    image: imageUrl("3.jpg"),
    localImageSrc: "/images/funnies/3.jpg",
    attributes: [
      { trait_type: "Variant", value: "3" },
      { trait_type: "Theme", value: "Bold" },
    ],
    metadataUrl: metadataUrl("3.json"),
  },
  {
    id: 4,
    name: "Funnies #4",
    description: "Funnies NFT Variant 4",
    image: imageUrl("4.jpg"),
    localImageSrc: "/images/funnies/4.jpg",
    attributes: [
      { trait_type: "Variant", value: "4" },
      { trait_type: "Theme", value: "Gradient" },
    ],
    metadataUrl: metadataUrl("4.json"),
  },
  {
    id: 5,
    name: "Funnies #5",
    description: "Funnies NFT Variant 5",
    image: imageUrl("5.jpg"),
    localImageSrc: "/images/funnies/5.jpg",
    attributes: [
      { trait_type: "Variant", value: "5" },
      { trait_type: "Theme", value: "Electric" },
    ],
    metadataUrl: metadataUrl("5.json"),
  },
]

export const getDisplayImageUrl = (nft: FunniesNft) => {
  if (nft.localImageSrc) return nft.localImageSrc
  if (nft.image) {
    return nft.image.startsWith("ipfs://")
      ? `https://gateway.pinata.cloud/ipfs/${nft.image.replace("ipfs://", "")}`
      : nft.image
  }
  return ""
}

export function getRandomNft(): FunniesNft {
  return NFT_VARIANTS[Math.floor(Math.random() * NFT_VARIANTS.length)]
}
