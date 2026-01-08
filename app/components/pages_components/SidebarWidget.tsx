import React from 'react'

export function SidebarWidget({title, children}: {title: string, children: React.ReactNode}) {
  return (
    <div>
      <div>
        <h2 className="secular text-2xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
} 
