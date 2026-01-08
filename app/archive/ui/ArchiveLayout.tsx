import { ReactNode } from 'react';

interface ArchiveLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function ArchiveLayout({ sidebar, content }: ArchiveLayoutProps) {
  return (
    <div className="flex flex-row min-h-screen" dir="rtl">
      {/* Content Area - Left (70%) */}
      <main className="flex-1 bg-white p-8">
        {content}
      </main>
      
      {/* Sidebar - Right (30%) - Adjusted to be flexible or default */}
      <aside className="w-1/4 bg-gray-50 border-l border-gray-200 sticky top-0 h-screen overflow-y-auto shrink-0 sidebar-container">
        {sidebar}
      </aside>
    </div>
  );
}
