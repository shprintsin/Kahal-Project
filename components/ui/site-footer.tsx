import type { FooterColumn } from "@/app/admin/types/menus";
import { getContentTranslation } from "@/lib/i18n/content-translation";

interface SiteFooterProps {
  columns: FooterColumn[];
  copyrightText: string;
  locale?: string;
}

function resolveText(
  localized: { default: string; translations: Record<string, string> },
  locale?: string
): string {
  if (!locale) return localized.default;
  return getContentTranslation(localized.translations, locale, localized.default);
}

export function SiteFooter({ columns, copyrightText, locale }: SiteFooterProps) {
  if (columns.length === 0) {
    return (
      <footer className="bg-brand-primary-dark text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm">
          <p>{copyrightText}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-brand-primary-dark text-white py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns.length >= 3 ? "md:grid-cols-3" : ""} ${columns.length >= 4 ? "lg:grid-cols-4" : ""} gap-6 sm:gap-8`}>
          {columns.map((column) => (
            <div key={column.id || column.order}>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                {resolveText(column.title, locale)}
              </h3>
              {column.type === "RICH_TEXT" ? (
                <div
                  className="text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: resolveText(column.content, locale) }}
                />
              ) : (
                <ul className="text-xs sm:text-sm space-y-2">
                  {column.items.map((item) => (
                    <li key={item.id || item.order}>
                      <a href={item.url || "#"} className="hover:underline">
                        {resolveText(item.label, locale)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border-footer text-center text-xs sm:text-sm">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
