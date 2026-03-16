import React from 'react'

export function SidebarWidget({title, children}: {title: string, children: React.ReactNode}) {
  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
} 
