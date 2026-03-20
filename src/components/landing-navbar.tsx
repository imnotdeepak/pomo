"use client"

import { NavBar } from "@/components/ui/tubelight-navbar"
import { Home, LogIn, UserPlus } from "lucide-react"

const navItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Login", url: "/login", icon: LogIn },
  { name: "Sign Up", url: "/signup", icon: UserPlus },
]

export function LandingNavbar() {
  return <NavBar items={navItems} />
}
