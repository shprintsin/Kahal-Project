import React from 'react';
import styles from './css/globalFooter.module.css';

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


    <footer className="bg-[#0d4d2c] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">אודות</h3>
              <p className="text-sm">
                פרויקט קהילות מזרח אירופה הוא מיזם מחקרי המתעד 1000 שנות היסטוריה של קהילות יהודיות במזרח אירופה.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">צור קשר</h3>
              <p className="text-sm">info@example.ac.il</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">מדיניות פרטיות</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="/privacy" className="hover:underline">
                    מדיניות פרטיות
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:underline">
                    תנאי שימוש
                  </a>
                </li>
                <li>
                  <a href="/accessibility" className="hover:underline">
                    נגישות
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#0a3d22] text-center text-sm">
            <p>© 2024 פרויקט הקהל. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
  );
} 
