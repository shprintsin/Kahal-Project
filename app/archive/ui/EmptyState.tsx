'use client';

import { PageTitle, PageSubtitle } from '@/app/components/layout/ui/Components';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <PageTitle className="text-center">ברוכים הבאים לארכיון</PageTitle>
      <PageSubtitle className="text-center max-w-2xl">
        עיין באוסף החומרים ההיסטוריים שלנו. בחר אוסף מהתפריט כדי להתחיל.
      </PageSubtitle>
      
      <div className="mt-8 bg-gray-50 p-6 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">סטטיסטיקות</h3>
        <div className="space-y-2 text-gray-600 text-right">
          <p>• 2 אוספים</p>
          <p>• 4 סדרות</p>
          <p>• 60 כרכים</p>
        </div>
      </div>
    </div>
  );
}
