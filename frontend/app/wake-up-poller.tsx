"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function WakeUpPoller() {
  const router = useRouter()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    async function check() {
      try {
        const res = await fetch("/api/health")
        if (res.ok) {
          console.log("backend awake, refreshing page")
          clearInterval(interval)
          router.refresh()
          return true
        }
      } catch {
        // ignore, will retry
      }
      console.log("backend still sleeping, retrying in 2s…")
      return false
    }

    check().then((awake) => {
      if (!awake) {
        interval = setInterval(check, 2000)
      }
    })

    return () => clearInterval(interval)
  }, [router])

  return null
}
