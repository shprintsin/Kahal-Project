import type { FooterColumn } from "@/app/admin/types/menus";

interface SiteFooterProps {
  columns: FooterColumn[];
  copyrightText: string;
}

export function SiteFooter({ columns, copyrightText }: SiteFooterProps) {
  if (columns.length === 0) {
    return (
      <footer className="bg-[#0d4d2c] text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm">
          <p>{copyrightText}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0d4d2c] text-white py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns.length >= 3 ? "md:grid-cols-3" : ""} ${columns.length >= 4 ? "lg:grid-cols-4" : ""} gap-6 sm:gap-8`}>
          {columns.map((column) => (
            <div key={column.id || column.order}>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                {column.title.default}
              </h3>
              {column.type === "RICH_TEXT" ? (
                <div
                  className="text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: column.content.default }}
                />
              ) : (
                <ul className="text-xs sm:text-sm space-y-2">
                  {column.items.map((item) => (
                    <li key={item.id || item.order}>
                      <a href={item.url || "#"} className="hover:underline">
                        {item.label.default}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#0a3d22] text-center text-xs sm:text-sm">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
