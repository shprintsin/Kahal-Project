import React from 'react'
import CategoryBlocks from './CategoryBlocks'
import ActionButtons from './ActionButtons'
import {Category, ActionButton, HeroText } from '@/app/types'

export default function Hero({heroText, actionItems, categories}: {heroText: HeroText, actionItems: Record<string, ActionButton>, categories: Category[]}) {
  return (
    <div className="p-25 flex flex-row justify-around">
      {/* Right col */}
      <div className="flex flex-col justify-around w-1/2">
        {/* hero */}
        <div className="text-right font-['Secular_One'] mb-12 mt-8">
          <h1 className="text-white text-7xl font-bold mb-2">{heroText.title}</h1>
          <h2 className="text-white text-4xl mb-6">{heroText.subtitle}</h2>
        </div>

        {/* Action Buttons */}
        <ActionButtons items={actionItems} />
      </div>

      <div className="w-3/5 pr-[30px] flex flex-col justify-around">
        {/* Category Tiles */}
        <CategoryBlocks categories={categories} />
      </div>
    </div>
  )
}

