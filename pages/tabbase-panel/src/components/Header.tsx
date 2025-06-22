import React from 'react'
import { Box } from '@mantine/core'

import { useAppDispatch, useAppSelector } from '@extension/tabbase-shared'
import { onActGetSpaces } from '@extension/tabbase-shared/lib/redux/features/tab/tab.slice'

import ScrollContent from './Features/Scroll'

const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const spaces = useAppSelector(state => state.tab._spaces)

  React.useEffect(() => {
    dispatch(onActGetSpaces())
  }, [dispatch])

  const onChangeActiveSpace = (id: string) => {
    console.log(`Clicked on item with id: ${id}`)
  }

  return (
    <div style={{ border: '1px solid #000', padding: '5px' }}>
      <div style={{ padding: '10px' }}>
        <Box px={10} mb={6} mt={8}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 'calc(100% - 80px)', height: '100%' }}>
              <ScrollContent
                onClick={id => {
                  onChangeActiveSpace(id)
                }}
                // activeId={_activeSpaceId}
                items={[
                  ...spaces,
                  { id: 'new-tab-filter-1', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-2', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-3', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-4', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-5', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-6', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-7', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-8', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                  { id: 'new-tab-filter-9', name: '+ New Tab Filter', tabs: [], keywords: [], websites: [] },
                ]}
              />
            </div>
          </div>
        </Box>
      </div>
    </div>
  )
}

export default Header
