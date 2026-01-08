import React from 'react'

export function SidebarCard({children}: {children: React.ReactNode}) {
  return (
    <div className="bg-white rounded-none  p-4">
      {children}
    </div>
  )
} 
