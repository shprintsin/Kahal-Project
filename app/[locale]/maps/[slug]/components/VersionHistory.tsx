"use client"

import { useState } from "react"
import { ChevronDown, History } from "lucide-react"
import { DlField } from "@/components/ui/dl-field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { getDateLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"

interface Deployment {
  id: string
  version: string
  changeLog: string | null
  gitSha: string | null
  deployedAt: string | Date
}

interface VersionHistoryProps {
  version: string | null | undefined
  deployments: Deployment[]
}

const PREVIEW_LIMIT = 5

function formatDate(date: string | Date, dateLocale: string = "he-IL"): string {
  return new Date(date).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function DeploymentEntry({ d, dateLocale }: { d: Deployment; dateLocale?: string }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 text-foreground font-medium">
        <span className="font-mono">v{d.version}</span>
        <span className="text-muted-foreground">{formatDate(d.deployedAt, dateLocale)}</span>
        {d.gitSha && (
          <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-muted-foreground">
            {d.gitSha.slice(0, 7)}
          </code>
        )}
      </div>
      {d.changeLog && (
        <p className="text-muted-foreground mt-1 leading-relaxed">
          {d.changeLog}
        </p>
      )}
    </div>
  )
}

export function VersionHistory({ version, deployments }: VersionHistoryProps) {
  const locale = useLocale()
  const dateLocale = getDateLocale(locale as Locale)
  const t = useTranslations('public.datasets')
  const versionLabel = t('version')
  const [expanded, setExpanded] = useState(false)

  if (!version && deployments.length === 0) return null

  if (deployments.length === 0) {
    return (
      <DlField label={versionLabel} border={false}>
        <span className="font-mono">{version}</span>
      </DlField>
    )
  }

  const preview = deployments.slice(0, PREVIEW_LIMIT)
  const hasMore = deployments.length > PREVIEW_LIMIT

  return (
    <div className="flex flex-col gap-2 text-start">
      <dt className="text-sm font-semibold text-body font-display">{versionLabel}</dt>
      <dd>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-foreground text-base hover:text-brand-primary transition-colors"
        >
          <span className="font-mono">v{deployments[0].version}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            {preview.map((d) => (
              <DeploymentEntry key={d.id} d={d} dateLocale={dateLocale} />
            ))}

            {hasMore && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-muted-foreground hover:text-foreground transition-colors"
                    title="הצג את כל השינויים"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-end">היסטוריית גרסאות</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    {deployments.map((d) => (
                      <DeploymentEntry key={d.id} d={d} dateLocale={dateLocale} />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </dd>
    </div>
  )
}
