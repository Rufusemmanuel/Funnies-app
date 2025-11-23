import { type FunniesNft } from "./nfts"

type StoredMint = {
  address: string
  nft: FunniesNft
  txHash?: `0x${string}` | undefined
  mintedAt: number
}

const STORAGE_KEY = "funnies-mint-history"

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const readStorage = (): StoredMint[] => {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredMint[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeStorage = (records: StoredMint[]) => {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore write failures
  }
}

export const findMintForAddress = (address?: string) => {
  if (!address) return null
  const target = address.toLowerCase()
  const records = readStorage()
  return records.find((r) => r.address.toLowerCase() === target) ?? null
}

export const upsertMintRecord = (record: StoredMint) => {
  if (!record.address) return
  const target = record.address.toLowerCase()
  const records = readStorage()
  const idx = records.findIndex((r) => r.address.toLowerCase() === target)
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...record, address: target }
  } else {
    records.push({ ...record, address: target })
  }
  writeStorage(records)
}
