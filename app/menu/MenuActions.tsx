"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { parseEther } from "viem"
import { base } from "viem/chains"

import { Button } from "@/components/ui/button"
import { menuAbi, menuContracts } from "@/lib/contracts"

type MenuAction = "win" | "draw" | "loose"

const actionLabels: Record<MenuAction, string> = {
  win: "Win",
  draw: "Draw",
  loose: "Loose",
}

const actionVariants: Record<MenuAction, "default" | "secondary" | "outline"> = {
  win: "default",
  draw: "secondary",
  loose: "outline",
}

export function MenuActions() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync, isPending } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [status, setStatus] = useState<"idle" | "wallet" | "submitted" | "confirmed" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id,
  })

  const explorerBase = useMemo(
    () => process.env.NEXT_PUBLIC_BASE_EXPLORER_URL?.replace(/\/$/, "") || "https://basescan.org",
    [],
  )

  useEffect(() => {
    if (!receipt) return
    if (receipt.status === "success") {
      setStatus("confirmed")
      setStatusMessage("Confirmed on Base.")
    } else if (receipt.status === "reverted") {
      setStatus("error")
      setStatusMessage("Transaction reverted.")
    }
  }, [receipt])

  const ensureBaseChain = useCallback(async () => {
    if (chainId === base.id) return true
    if (!switchChainAsync) return false
    try {
      await switchChainAsync({ chainId: base.id })
      return true
    } catch (err) {
      console.error("Failed to switch chain", err)
      return false
    }
  }, [chainId, switchChainAsync])

  const handleAction = useCallback(
    async (action: MenuAction) => {
      if (!isConnected) {
        setStatus("error")
        setStatusMessage("Connect a wallet first.")
        return
      }

      const onBase = await ensureBaseChain()
      if (!onBase) {
        setStatus("error")
        setStatusMessage("Switch to Base mainnet to continue.")
        return
      }

      setStatus("idle")
      setStatusMessage(null)
      setTxHash(undefined)
      setStatus("wallet")
      setStatusMessage("Confirm in wallet...")

      try {
        const hash = await writeContractAsync({
          address: menuContracts[action],
          abi: menuAbi,
          functionName: action,
          chainId: base.id,
          value: parseEther("0.000001"),
        })
        setTxHash(hash)
        setStatus("submitted")
        setStatusMessage("Submitted to Base.")
      } catch (err: any) {
        console.error(err)
        setStatus("error")
        setStatusMessage(err?.shortMessage ?? err?.message ?? "Transaction failed.")
      }
    },
    [ensureBaseChain, isConnected, writeContractAsync],
  )

  const isBusy = isPending || isConfirming
  const txLink = txHash ? `${explorerBase}/tx/${txHash}` : null

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {(Object.keys(actionLabels) as MenuAction[]).map((action) => (
          <Button
            key={action}
            className="w-full h-12 text-base font-semibold"
            variant={actionVariants[action]}
            disabled={isBusy}
            onClick={() => void handleAction(action)}
          >
            {actionLabels[action]}
          </Button>
        ))}
      </div>

      {(statusMessage || txLink) && (
        <div className="rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-sm text-muted-foreground">
          {statusMessage && (
            <span className={status === "error" ? "text-destructive" : ""}>{statusMessage}</span>
          )}
          {txLink && (
            <a
              className="ml-2 text-primary underline underline-offset-4"
              href={txLink}
              target="_blank"
              rel="noreferrer"
            >
              View tx
            </a>
          )}
        </div>
      )}
    </div>
  )
}
