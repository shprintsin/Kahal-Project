import React from 'react';
import { FooterItem } from '@/app/types';
import { getIcon } from '../../utils/icons';

interface FooterProps {
  items: FooterItem[];
}

export default function HomeBlockFooter({ items }: FooterProps) {
  return (
    <footer className="relative bottom-0 bg-[var(--dark-green)] text-white w-full py-3">
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-16">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex transition-opacity duration-200 hover:opacity-80"
            >
              <span className="text-base ml-2">{item.label}</span>
              {getIcon({ name: item.icon })}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
