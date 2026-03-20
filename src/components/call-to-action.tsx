'use client'

import { Suspense, lazy, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const Dithering = lazy(() =>
    import('@paper-design/shaders-react').then((mod) => ({ default: mod.Dithering }))
)

export default function CallToAction() {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <section
            className="min-h-screen flex items-center px-4 md:px-6 relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen">
                    <Dithering
                        colorBack="#00000000"
                        colorFront="#fc6d6d"
                        shape="warp"
                        type="4x4"
                        speed={isHovered ? 0.6 : 0.2}
                        className="size-full"
                        minPixelRatio={1}
                    />
                </div>
            </Suspense>

            <div className="mx-auto max-w-5xl px-6 relative z-10 w-full">
                <div className="text-center">
                    <h2 className="font-serif text-balance text-4xl font-semibold lg:text-5xl">Start your first session today.</h2>
                    <p className="mt-4 text-muted-foreground text-lg">Join thousands of focused people building better work habits with Pomo.</p>

                    <div className="mt-12 flex justify-center">
                        <Button asChild size="lg" className="border border-primary-foreground/20 transition-all duration-300 hover:ring-4 hover:ring-primary/30 hover:scale-105 active:scale-95">
                            <Link href="/signup">
                                <span>Get Started</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
