"use client"

import * as React from "react"
import { DownloadTermsDialog } from "@/components/ui/download-terms-dialog"

type PendingAction = () => void | Promise<void>

interface DownloadTermsContextValue {
  requestDownload: (action: PendingAction) => void
}

const DownloadTermsContext = React.createContext<DownloadTermsContextValue | null>(null)

export function useDownloadTerms(): DownloadTermsContextValue {
  const ctx = React.useContext(DownloadTermsContext)
  if (!ctx) {
    throw new Error("useDownloadTerms must be used within <DownloadTermsProvider>")
  }
  return ctx
}

export function DownloadTermsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const pendingRef = React.useRef<PendingAction | null>(null)

  const requestDownload = React.useCallback((action: PendingAction) => {
    pendingRef.current = action
    setOpen(true)
  }, [])

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (!next) pendingRef.current = null
    setOpen(next)
  }, [])

  const handleAccept = React.useCallback(() => {
    const action = pendingRef.current
    pendingRef.current = null
    setOpen(false)
    if (action) {
      void action()
    }
  }, [])

  const value = React.useMemo<DownloadTermsContextValue>(
    () => ({ requestDownload }),
    [requestDownload],
  )

  return (
    <DownloadTermsContext.Provider value={value}>
      {children}
      <DownloadTermsDialog open={open} onOpenChange={handleOpenChange} onAccept={handleAccept} />
    </DownloadTermsContext.Provider>
  )
}
