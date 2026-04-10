"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"

interface DownloadTermsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
}

export function DownloadTermsDialog({ open, onOpenChange, onAccept }: DownloadTermsDialogProps) {
  const t = useTranslations()
  const locale = useLocale()
  const isRtl = locale === 'he'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRtl ? "rtl" : "ltr"}
        className={cn("sm:max-w-xl", isRtl ? "text-right" : "text-left")}
      >
        <DialogHeader className={isRtl ? "text-right sm:text-right" : "text-left sm:text-left"}>
          <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <DialogTitle className="font-display">
              {t(
                "public.downloadTerms.title",
                "תנאי שימוש והבהרה בנוגע לנתונים (Work in Progress)",
              )}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {t("public.downloadTerms.srDescription", "Terms of use and download confirmation")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          <p>
            {t(
              "public.downloadTerms.paragraph1",
              "הנתונים והשכבות הגיאוגרפיות הזמינים להורדה הם חלק ממחקר פעיל ומסופקים כמות שהם (As-Is). הנתונים בשלב זה אינם סופיים או שלמים, וייתכן שיתוקנו או יעודכנו בהמשך. כדי להגן על שלמות המחקר, חלים התנאים הבאים:",
            )}
          </p>
          <p>
            {t(
              "public.downloadTerms.paragraph2",
              "אין לעשות שימוש מסחרי או אקדמי-מחקרי בנתונים, אין לפרסם עבודות או מאמרים המבוססים עליהם, ואין להפיץ אותם הלאה לצד שלישי. כמו כן, אין להשתמש בנתונים לצורך קבלת החלטות מקצועית, ללא קבלת אישור מפורש מראש והתייעצות עם צוות המחקר.",
            )}
          </p>
          <p className="font-semibold">
            {t(
              "public.downloadTerms.paragraph3",
              "בלחיצה על 'הורדה', הנך מאשר/ת שקראת והבנת תנאים אלו, וכי כל זכויות היוצרים שמורות לחוקרים.",
            )}
          </p>
        </div>

        <DialogFooter className={isRtl ? "sm:flex-row-reverse sm:justify-start" : undefined}>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-border text-sm font-semibold bg-white hover:bg-muted transition-colors"
          >
            {t("public.downloadTerms.cancel", "ביטול")}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-brand-primary hover:bg-brand-primary-dark text-white transition-colors shadow-sm"
          >
            {t("public.downloadTerms.accept", "הורדה")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
