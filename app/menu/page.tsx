import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MenuActions } from "./MenuActions"

export default function MenuPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60" />
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-accent/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply opacity-50" />
      <div className="absolute top-6 left-6 z-20">
        <Button asChild variant="ghost" size="sm" className="bg-white/60 backdrop-blur">
          <Link href="/">Back</Link>
        </Button>
      </div>

      <div className="z-10 w-full max-w-md">
        <Card className="p-8 border-border/50 bg-white/70 backdrop-blur-xl shadow-xl ring-1 ring-black/5 space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Menu</h1>
            <p className="text-sm text-muted-foreground">Quick actions</p>
          </div>
          <MenuActions />
        </Card>
      </div>
    </main>
  )
}
