"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { sdk as miniapp } from "@farcaster/miniapp-sdk"
import type { MiniAppContext, MiniAppUser } from "@farcaster/miniapp-core"
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useChainId,
  useWaitForTransactionReceipt,
  useSendCalls,
} from "wagmi"
import { encodeFunctionData, toHex } from "viem"
import { base } from "viem/chains"
import { AlertTriangle, BadgeCheck, CheckCircle2, Loader2Icon, Wallet, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NFT_VARIANTS, getDisplayImageUrl, getRandomNft, type FunniesNft } from "@/lib/nfts"
import { nftAbi } from "@/lib/nftAbi"
import { findMintForAddress, upsertMintRecord } from "@/lib/mintStorage"
import { FullScreenSuccess } from "./components/FullScreenSuccess"
import { appendBuilderCodeSuffix, sendCallsCapabilities } from "@/lib/builderCode"

type ClaimState = "idle" | "loading" | "success" | "error"

export default function AirdropPage() {
  const { address, isConnected: isWalletConnected } = useAccount()
  const { connect, connectors, status: connectStatus } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const currentChainId = useChainId()
  const { sendCallsAsync } = useSendCalls()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id,
  })

  const [claimStatus, setClaimStatus] = useState<ClaimState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedNft, setSelectedNft] = useState<FunniesNft | null>(null)
  const [miniContext, setMiniContext] = useState<MiniAppContext | null>(null)
  const [devUser, setDevUser] = useState<MiniAppUser | null>(null)
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)
  const [readySent, setReadySent] = useState(false)
  const [hasMinted, setHasMinted] = useState(false)
  const [mintedNft, setMintedNft] = useState<FunniesNft | null>(null)
  const [mintTxHash, setMintTxHash] = useState<string | undefined>(undefined)
  const addPromptShown = useRef(false) // prevent double-invoking the add-miniapp prompt

  const mintContract = process.env.NEXT_PUBLIC_MINT_CONTRACT as `0x${string}` | undefined

  const primaryConnector = useMemo(() => {
    if (isMiniApp) {
      return connectors.find((c) => c.id.toLowerCase().includes("farcaster")) ?? connectors[0]
    }
    // Outside the Mini App shell, prefer an injected or walletconnect-style connector.
    return (
      connectors.find((c) => c.id.toLowerCase().includes("injected")) ??
      connectors.find((c) => c.id.toLowerCase().includes("wallet")) ??
      connectors[0]
    )
  }, [connectors, isMiniApp])

  const activeUser = miniContext?.user ?? devUser ?? null
  const isEligible = activeUser ? activeUser.fid <= 1_000_000 : false

  const refreshMiniAppContext = useCallback(async () => {
    try {
      const inMiniApp = await miniapp.isInMiniApp()
      setIsMiniApp(inMiniApp)
      if (!inMiniApp) return

      const ctx = await miniapp.context
      setMiniContext(ctx)
    } catch (err: any) {
      setContextError(err?.message ?? "Unable to load Farcaster context")
    }
  }, [])

  const syncMintFromStorage = useCallback(
    (wallet?: string) => {
      const target = wallet ?? address
      if (!target) {
        setHasMinted(false)
        setMintedNft(null)
        setMintTxHash(undefined)
        setClaimStatus("idle")
        return
      }

      const record = findMintForAddress(target)
      if (record) {
        setMintedNft(record.nft)
        setHasMinted(true)
        setMintTxHash(record.txHash)
        setClaimStatus("success")
      } else {
        setHasMinted(false)
        setMintedNft(null)
        setMintTxHash(undefined)
        setClaimStatus("idle")
      }
    },
    [address],
  )

  const sendWithBuilderCode = useCallback(
    async (calls: { to: `0x${string}`; data?: `0x${string}`; value?: bigint }[]) => {
      const eth = typeof window !== "undefined" ? (window as any).ethereum : undefined
      const isFarcasterMiniApp = () => {
        if (typeof window === "undefined") return false
        try {
          if (/Farcaster|Warpcast/i.test(navigator.userAgent)) return true
          const g = window as any
          if (g.farcaster || g.sdk) return true
          if (window.parent && window.parent !== window) return true
        } catch {}
        return false
      }
      const extractHash = (res: any): `0x${string}` | undefined => {
        if (!res) return undefined
        if (typeof res === "string") return res as `0x${string}`
        if (Array.isArray(res)) {
          const first = res[0]
          if (first?.hash && typeof first.hash === "string") return first.hash as `0x${string}`
        }
        if (res?.hash && typeof res.hash === "string") return res.hash as `0x${string}`
        return undefined
      }

      const first = calls[0]
      if (!first) throw new Error("No calls provided for transaction send.")

      // If Farcaster/Warpcast mini app, skip sendCalls/wallet_sendCalls and go straight to eth_sendTransaction.
      const useDirectEthSend = isFarcasterMiniApp()

      if (!useDirectEthSend) {
        try {
          const res = await sendCallsAsync?.({
            calls,
            chainId: base.id,
            capabilities: sendCallsCapabilities(),
          })
          const hash = extractHash(res)
          if (hash) return hash
        } catch {
          // continue to fallback
        }

        if (eth?.request) {
          try {
            await eth.request({ method: "eth_requestAccounts" })
          } catch {
            /* ignore */
          }
          try {
            const res = await eth.request({
              method: "wallet_sendCalls",
              params: [
                {
                  calls: calls.map((c) => ({
                    to: c.to,
                    data: c.data,
                    value: c.value !== undefined ? toHex(c.value) : undefined,
                  })),
                  capabilities: sendCallsCapabilities(),
                },
              ],
            })
            const hash = extractHash(res)
            if (hash) return hash
          } catch {
            /* continue to eth_sendTransaction */
          }
        }
      }

      if (eth?.request) {
        const txData = appendBuilderCodeSuffix((first.data || "0x") as `0x${string}`)
        const res = await eth.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: first.to,
              data: txData,
              from: address,
              value: first.value !== undefined ? toHex(first.value) : undefined,
            },
          ],
        })
        const hash = extractHash(res)
        if (hash) return hash
      }

      throw new Error("Unable to send transaction with builder code attached.")
    },
    [address, sendCallsAsync],
  )

  const handleClaim = useCallback(async () => {
    const storedMint = findMintForAddress(address)
    if (storedMint) {
      setMintedNft(storedMint.nft)
      setHasMinted(true)
      setMintTxHash(storedMint.txHash)
      setClaimStatus("success")
      return
    }

    if (!activeUser) {
      setErrorMessage("Farcaster context not ready.")
      setClaimStatus("error")
      return
    }

    if (!isEligible) {
      setErrorMessage("Only FIDs 1,000,000 or earlier can claim.")
      setClaimStatus("error")
      return
    }

    if (!address) {
      setErrorMessage("Connect a wallet first.")
      setClaimStatus("error")
      return
    }

    if (!mintContract) {
      setErrorMessage("Set NEXT_PUBLIC_MINT_CONTRACT before minting.")
      setClaimStatus("error")
      return
    }

    const pick = getRandomNft()
    setSelectedNft(pick)
    setClaimStatus("loading")
    setErrorMessage("")

    try {
      const data = encodeFunctionData({
        abi: nftAbi,
        functionName: "safeMint",
        args: [address, pick.metadataUrl],
      })
      const hash = await sendWithBuilderCode([{ to: mintContract, data }])
      setTxHash(hash)
      setMintedNft(pick)
      setMintTxHash(hash)
    } catch (err: any) {
      console.error(err)
      setClaimStatus("error")
      setErrorMessage(err?.shortMessage ?? err?.message ?? "Mint failed. Check console for details.")
    }
  }, [activeUser, address, isEligible, mintContract, sendWithBuilderCode])

  useEffect(() => {
    void refreshMiniAppContext()
  }, [refreshMiniAppContext])

  useEffect(() => {
    const promptAddMiniApp = async () => {
      if (addPromptShown.current) return
      try {
        const inMiniApp = await miniapp.isInMiniApp()
        if (!inMiniApp) return
        addPromptShown.current = true
        await miniapp.actions.addMiniApp() // Triggers Farcaster native add/notify sheet
      } catch (err) {
        console.warn("Add Mini App prompt skipped", err)
      }
    }
    void promptAddMiniApp()
  }, [])

  useEffect(() => {
    if (receipt?.status === "success") {
      setClaimStatus("success")
      if (address && mintedNft) {
        upsertMintRecord({
          address,
          nft: mintedNft,
          txHash: mintTxHash,
          mintedAt: Date.now(),
        })
        setHasMinted(true)
      }
    } else if (receipt?.status === "reverted") {
      setClaimStatus("error")
      setErrorMessage("Transaction reverted. Check gas or contract settings.")
    }
  }, [address, mintedNft, mintTxHash, receipt])

  useEffect(() => {
    const syncPrimaryButton = async () => {
      const title = claimStatus === "success" ? "Minted" : "Claim NFT"
      const disabled = !isEligible || !address || claimStatus === "loading"
      const loading = claimStatus === "loading"
      try {
        await miniapp.actions.ready({ title: "funnies", primaryButton: { title } })
        await miniapp.actions.setPrimaryButton({ title, disabled, loading })
        setReadySent(true)
      } catch {
        // Ignore outside Mini App shell
      }
    }

    if (!readySent) {
      void syncPrimaryButton()
    } else {
      // Keep label/state in sync after first ready call.
      void (async () => {
        try {
          await miniapp.actions.setPrimaryButton({
            title: claimStatus === "success" ? "Minted" : "Claim NFT",
            disabled: !isEligible || !address || claimStatus === "loading",
            loading: claimStatus === "loading",
          })
        } catch {
          /* ignore */
        }
      })()
    }
  }, [address, claimStatus, isEligible, readySent])

  useEffect(() => {
    if (!isMiniApp) return
    const handler = () => void handleClaim()
    miniapp.on("primaryButtonClicked", handler)
    return () => miniapp.off("primaryButtonClicked", handler)
  }, [handleClaim, isMiniApp])

  const connectWallet = async () => {
    if (!primaryConnector) return
    const res = await connect({ connector: primaryConnector, chainId: base.id })
    if (res?.chainId !== base.id && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: base.id })
      } catch (err) {
        console.error("Failed to switch chain", err)
      }
    }
  }

  useEffect(() => {
    syncMintFromStorage()
  }, [address, syncMintFromStorage])

  useEffect(() => {
    if (!isWalletConnected || !switchChainAsync) return
    if (currentChainId && currentChainId !== base.id) {
      void switchChainAsync({ chainId: base.id }).catch((err) => {
        console.error("Chain switch rejected or failed", err)
      })
    }
  }, [currentChainId, isWalletConnected, switchChainAsync])

  const launchDevIdentity = () => {
    setDevUser({
      fid: 8888,
      username: "funnies-builder",
      displayName: "Funnies Dev",
      pfpUrl: "/placeholder.svg?height=96&width=96",
    })
  }

  const eligibilityBanner = !activeUser ? (
    <p className="text-sm text-muted-foreground">Waiting for Farcaster context...</p>
  ) : isEligible ? (
    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
      <CheckCircle2 className="h-4 w-4" />
      FID eligible
    </div>
  ) : (
    <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
      <XCircle className="h-4 w-4" />
      FID too high for this drop
    </div>
  )

  const explorerBase = process.env.NEXT_PUBLIC_BASE_EXPLORER_URL?.replace(/\/$/, "") || "https://basescan.org"
  const txLink = txHash ? `${explorerBase}/tx/${txHash}` : undefined

  const nftToShow =
    mintedNft ??
    selectedNft ??
    ({
      id: 0,
      name: "Your Funnies",
      description: "Already minted NFT",
      image: "",
      localImageSrc: "/images/funnies/placeholder.jpg",
      metadataUrl: "",
      attributes: [],
    } as FunniesNft)

  if (hasMinted && nftToShow) {
    return (
      <FullScreenSuccess
        nft={nftToShow}
        txHash={mintTxHash}
        explorerBase={explorerBase}
        onBack={() => {
          setClaimStatus("idle")
          setMintedNft(null)
          setHasMinted(false)
          setMintTxHash(undefined)
        }}
      />
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60" />
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-accent/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply opacity-50" />

      <div className="z-10 w-full max-w-4xl space-y-8">
        <div className="text-center space-y-3 flex flex-col items-center">
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm">
            funnies
          </h1>
          <p className="text-muted-foreground font-medium">
            NFT airdrop for early Farcaster supporters - delivered straight to your Base wallet.
          </p>
        </div>

        {!isMiniApp && (
          <Card className="p-4 border-dashed border-accent/30 bg-accent/10 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
              <div className="space-y-2">
                <p>
                  Open this page inside the Farcaster Mini App shell to auto-load FID context and use the native primary
                  button. For local testing, you can inject a debug user below.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={launchDevIdentity}>
                    Use debug identity (FID 8888)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open("https://miniapps.farcaster.xyz/docs/getting-started", "_blank")}
                  >
                    Mini App docs
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50 bg-white/60 backdrop-blur-xl shadow-xl ring-1 ring-black/5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Farcaster identity</h2>
              {eligibilityBanner}
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/80 border border-border/50 shadow-sm">
              {activeUser?.pfpUrl ? (
                <div className="relative">
                  <Image
                    src={activeUser.pfpUrl}
                    alt={activeUser.username ?? "Profile"}
                    width={72}
                    height={72}
                    className="rounded-full ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-[11px] font-bold px-2 py-0.5 rounded-full text-primary-foreground border border-background shadow-sm">
                    #{activeUser.fid}
                  </div>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-black text-primary">
                  F
                </div>
              )}

              <div className="flex-1">
                <p className="font-bold text-lg">@{activeUser?.username ?? "loading..."}</p>
                <p className="text-xs text-muted-foreground">
                  {activeUser ? `FID ${activeUser.fid}` : "Waiting for Farcaster context"}
                </p>
                <div className="mt-2 text-xs text-muted-foreground/70 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-accent" />
                  Mini App context drives eligibility and the primary CTA.
                </div>
              </div>
            </div>

            {contextError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{contextError}</span>
              </div>
            )}

            {!isEligible && activeUser && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2">
                <XCircle className="h-4 w-4 mt-0.5" />
                <span>This drop is only for FIDs 1,000,000 or earlier.</span>
              </div>
            )}
          </Card>

          <Card className="p-6 border-border/50 bg-white/60 backdrop-blur-xl shadow-xl ring-1 ring-black/5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Wallet</h2>
              {isWalletConnected ? (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full flex items-center gap-1 font-semibold border border-green-200">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                  Connect to Base
                </span>
              )}
            </div>

            {!isWalletConnected ? (
              <Button
                variant="outline"
                className="w-full h-12 text-base bg-white hover:bg-gray-50 border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all rounded-xl"
                onClick={connectWallet}
                disabled={connectStatus === "connecting" || !primaryConnector}
              >
                {connectStatus === "connecting" ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect wallet ({primaryConnector?.name ?? "Wallet"})
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-secondary/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    <span>
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:bg-background/50 text-foreground/70"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </Button>
                </div>

                {!hasMinted && (
                  <Button
                    className="w-full h-14 text-lg font-black bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-xl shadow-primary/20 rounded-2xl"
                    onClick={handleClaim}
                    disabled={claimStatus === "loading" || hasMinted || !isEligible}
                  >
                    {claimStatus === "loading" ? (
                      <>
                        <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                    Claiming on Base...
                  </>
                ) : (
                  "Claim NFT"
                )}
              </Button>
            )}

                {claimStatus === "error" && (
                  <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded animate-in fade-in slide-in-from-top-1">
                    {errorMessage}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              {!mintContract && <p className="text-destructive">Set NEXT_PUBLIC_MINT_CONTRACT to enable minting.</p>}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
