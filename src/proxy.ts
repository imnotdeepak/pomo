import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isBillingRoute = createRouteMatcher(['/billing'])

const PLAN_ID = 'access'

export default clerkMiddleware(async (auth, req) => {
  // Dashboard requires auth + active plan
  if (isProtectedRoute(req)) {
    await auth.protect()
    const { has } = await auth()
    const hasPlan = has({ plan: PLAN_ID })
    if (!hasPlan) {
      return NextResponse.redirect(new URL('/billing', req.url))
    }
  }

  // Billing page requires auth (but not plan)
  if (isBillingRoute(req)) {
    await auth.protect()
    const { has } = await auth()
    if (has({ plan: PLAN_ID })) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
