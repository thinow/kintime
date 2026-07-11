"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function WakeUpPoller() {
  const router = useRouter()

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/health")
        if (res.ok) {
          console.log("backend awake, refreshing page")
          clearInterval(poll)
          router.refresh()
        }
      } catch {
        console.log("backend still sleeping, retrying in 2s…")
      }
    }, 2000)

    return () => clearInterval(poll)
  }, [router])

  return null
}
