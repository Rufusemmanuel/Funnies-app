"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi"
import { injected } from "wagmi/connectors"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2Icon, Wallet, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"

// Mock Farcaster Auth Hook (Simulating Neynar)
// In a real app, replace this with @neynar/react hooks
function useFarcasterAuth() {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<{ fid: number; username: string; pfpUrl: string } | null>(null)

  const login = () => {
    // Simulating auth flow
    setTimeout(() => {
      setIsConnected(true)
      setUser({
        fid: 8888, // Change this to test > 1,000,000 logic (e.g., 1000001)
        username: "crypto_fan",
        pfpUrl: "/placeholder.svg?height=48&width=48",
      })
    }, 1000)
  }

  // Function to simulate a user with high FID for testing
  const loginHighFid = () => {
    setTimeout(() => {
      setIsConnected(true)
      setUser({
        fid: 1000001,
        username: "late_adopter",
        pfpUrl: "/placeholder.svg?height=48&width=48",
      })
    }, 1000)
  }

  return { isConnected, user, login, loginHighFid }
}

export default function AirdropPage() {
  const { isConnected: isFarcasterConnected, user: farcasterUser, login, loginHighFid } = useFarcasterAuth()
  const { address, isConnected: isWalletConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  const [claimStatus, setClaimStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleClaim = async () => {
    if (!farcasterUser || !address) return

    setClaimStatus("loading")
    setErrorMessage("")

    try {
      // 1. Request Signature
      const message = `Claiming Airdrop for FID: ${farcasterUser.fid}`
      const signature = await signMessageAsync({ message })

      // 2. Call Backend
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: farcasterUser.fid,
          address,
          signature,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim")
      }

      setClaimStatus("success")
    } catch (err: any) {
      console.error(err)
      setClaimStatus("error")
      setErrorMessage(err.message || "Something went wrong")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60" />
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-accent/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply opacity-50" />

      <div className="z-10 w-full max-w-md space-y-8">
        {/* Updated header to show "funnies" and conditionally display the user's PFP */}
        <div className="text-center space-y-2 flex flex-col items-center">
          {isFarcasterConnected && farcasterUser?.pfpUrl && (
            <div className="relative mb-4">
              <Image
                src={farcasterUser.pfpUrl || "/placeholder.svg"}
                alt={farcasterUser.username}
                width={96}
                height={96}
                className="rounded-full ring-4 ring-white shadow-xl scale-110 transition-transform"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
                #{farcasterUser.fid}
              </div>
            </div>
          )}
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm">
            funnies
          </h1>
          <p className="text-muted-foreground font-medium">Exclusive NFT for early adopters</p>
        </div>

        <Card className="p-6 border-border/50 bg-white/60 backdrop-blur-xl shadow-xl ring-1 ring-black/5 space-y-6">
          {/* Step 1: Farcaster Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                1. Farcaster Identity
              </h2>
              {isFarcasterConnected && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full flex items-center gap-1 font-semibold border border-green-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            {!isFarcasterConnected ? (
              <div className="space-y-3">
                <Button
                  onClick={login}
                  className="w-full bg-[#855DCD] hover:bg-[#855DCD]/90 text-white h-14 text-lg font-bold shadow-lg shadow-purple-500/20 rounded-xl transition-transform hover:scale-[1.02]"
                >
                  <div className="mr-2 h-7 w-7 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#855DCD] font-black text-sm">F</span>
                  </div>
                  Connect Farcaster
                </Button>
                <div className="text-center">
                  <button
                    onClick={loginHighFid}
                    className="text-xs text-muted-foreground underline decoration-dashed hover:text-primary transition-colors"
                  >
                    (Debug: Simulate High FID {">"} 1M)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/80 border border-border/50 shadow-sm">
                <div className="relative">
                  <Image
                    src={farcasterUser?.pfpUrl || ""}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full text-primary-foreground border border-background">
                    #{farcasterUser?.fid}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg">@{farcasterUser?.username}</p>
                  <p className="text-xs text-muted-foreground">ID: {farcasterUser?.fid}</p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Step 2: Wallet Connection & Claim */}
          <div
            className={`space-y-4 transition-all duration-500 ${!isFarcasterConnected ? "opacity-50 pointer-events-none grayscale blur-[1px]" : "opacity-100"}`}
          >
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">2. Claim Airdrop</h2>

            {isFarcasterConnected && farcasterUser && farcasterUser.fid > 1000000 ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-3">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Not Eligible</p>
                  <p className="opacity-90">This airdrop is only available for FIDs ≤ 1,000,000.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!isWalletConnected ? (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base bg-white hover:bg-gray-50 border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all rounded-xl"
                    onClick={() => connect({ connector: injected() })}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
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

                    <Button
                      className="w-full h-14 text-lg font-black bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-xl shadow-primary/20 rounded-2xl"
                      onClick={handleClaim}
                      disabled={claimStatus === "loading" || claimStatus === "success"}
                    >
                      {claimStatus === "loading" ? (
                        <>
                          <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : claimStatus === "success" ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          NFT Claimed!
                        </>
                      ) : (
                        "Claim NFT Airdrop"
                      )}
                    </Button>

                    {claimStatus === "error" && (
                      <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded animate-in fade-in slide-in-from-top-1">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground/50">
          <p>Powered by Farcaster & Wagmi</p>
        </div>
      </div>
    </main>
  )
}
