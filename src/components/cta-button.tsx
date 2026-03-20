"use client"

import { useRouter } from "next/navigation"
import { HoverButton } from "@/components/ui/hover-button"

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function CTAButton({ href, children, className }: CTAButtonProps) {
  const router = useRouter()
  return (
    <HoverButton className={className} onClick={() => router.push(href)}>
      {children}
    </HoverButton>
  )
}
