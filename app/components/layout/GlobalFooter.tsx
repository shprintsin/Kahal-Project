import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface GlobalFooterProps {
  links: FooterLink[];
  copyrightText: string;
}

export default function GlobalFooter({ links, copyrightText }: GlobalFooterProps) {
  return (
    <footer className="bg-[#0d4d2c] text-white py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">אודות</h3>
            <p className="text-xs sm:text-sm">
              פרויקט קהילות מזרח אירופה הוא מיזם מחקרי המתעד 1000 שנות היסטוריה של קהילות יהודיות במזרח אירופה.
            </p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">צור קשר</h3>
            <p className="text-xs sm:text-sm">info@example.ac.il</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">מדיניות פרטיות</h3>
            <ul className="text-xs sm:text-sm space-y-2">
              <li>
                <a href="/privacy" className="hover:underline">מדיניות פרטיות</a>
              </li>
              <li>
                <a href="/terms" className="hover:underline">תנאי שימוש</a>
              </li>
              <li>
                <a href="/accessibility" className="hover:underline">נגישות</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#0a3d22] text-center text-xs sm:text-sm">
          <p>© 2024 פרויקט הקהל. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
