import type React from 'react'
import { selectTabsList, useAppSelector } from '@extension/shared'

const Tabs: React.FC = () => {
  const { tabs } = useAppSelector(selectTabsList)

  return (
    <div>
      <div>TABS LIST</div>
      <div>
        {tabs.map((tab, index) => (
          <div key={index}>
            <div>{tab.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs
