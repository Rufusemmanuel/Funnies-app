import Link from "next/link"
import { getDisplayImageUrl, type FunniesNft } from "@/lib/nfts"

type Props = {
  nft: FunniesNft
  txHash?: `0x${string}` | undefined
  explorerBase: string
  onBack?: () => void
}

export function FullScreenSuccess({ nft, txHash, explorerBase, onBack }: Props) {
  const txLink = txHash ? `${explorerBase.replace(/\/$/, "")}/tx/${txHash}` : undefined
  const imageSrc = getDisplayImageUrl(nft)

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-b from-white via-slate-50 to-white px-4">
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">Congratulations! You minted:</p>
          <h1 className="text-4xl font-black tracking-tight text-primary">{nft.name}</h1>
        </div>

        <div className="w-full flex justify-center">
          <img
            src={imageSrc}
            alt={nft.name}
            style={{ width: "100%", maxWidth: "400px", borderRadius: "12px" }}
            className="border border-border shadow-2xl object-contain bg-white"
            loading="lazy"
          />
        </div>

        <div className="space-y-3 w-full max-w-3xl text-left">
          <div>
            <p className="text-sm uppercase text-muted-foreground font-semibold">Description</p>
            <p className="text-base text-foreground">{nft.description}</p>
          </div>
          <div>
            <p className="text-sm uppercase text-muted-foreground font-semibold">Traits</p>
            <div className="flex flex-wrap gap-2">
              {nft.attributes.map((t) => (
                <span
                  key={`${t.trait_type}-${t.value}`}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
                >
                  {t.trait_type}: {t.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {txLink && (
            <Link
              href={txLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow hover:opacity-90"
            >
              View on BaseScan
            </Link>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
