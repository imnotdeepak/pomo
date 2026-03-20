import { CTASection } from "@/components/ui/hero-dithering-card"
import { FeaturesSection } from "@/components/ui/feature-section-with-hover-effects"
import { Pricing } from "@/components/ui/single-pricing-card-1"
import CallToAction from "@/components/call-to-action"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        <span className="text-2xl font-serif font-bold text-foreground">Pomo</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-foreground/5">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            Sign up
          </Link>
        </div>
      </nav>
      <CTASection />
      <FeaturesSection />
      <Pricing />
      <CallToAction />
    </main>
  )
}
