import { Box } from '@mantine/core'
import type React from 'react'

import ScrollContent from '../Features/Scroll'

interface HeaderProps {
  title?: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div style={{ padding: '10px' }}>
      <Box px={10} mb={6} mt={8}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 'calc(100% - 80px)', height: '100%' }}>
            <ScrollContent
              tabFilters={[
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
  )
}

export default Header
