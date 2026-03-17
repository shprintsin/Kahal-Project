import { ReactNode } from 'react';

interface ArchiveLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function ArchiveLayout({ sidebar, content }: ArchiveLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <main className="flex-1 bg-white p-4 sm:p-6 md:p-8 order-2 md:order-1">
        {content}
      </main>
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 border-l border-gray-200 md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0 sidebar-container order-1 md:order-2">
        {sidebar}
      </aside>
    </div>
  );
}
