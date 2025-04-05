import React from 'react'
import { useAppDispatch } from '@extension/shared'
import { useStorage } from '@extension/shared'
import { examplePinTabsStorage } from '@extension/storage'
import Mock from './Mock/index'

import { onActPinTab } from '@extension/shared/lib/redux/features/tab/tab.slice'

const PinTabs = () => {
  const dispath = useAppDispatch()

  const theme = useStorage(examplePinTabsStorage)

  return (
    <div>
      {theme}
      <Mock />
      <button
        onClick={() => {
          dispath(onActPinTab())
        }}>
        PIN TABS
      </button>
    </div>
  )
}

export default PinTabs
