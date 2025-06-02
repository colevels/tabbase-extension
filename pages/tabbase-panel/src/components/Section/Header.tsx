import { useAppDispatch, useAppSelector } from '@extension/tabbase-shared'
import { selectContainersSpacesDisplay } from '@extension/tabbase-shared/lib/redux/features/tab/tab.selector'
import { onActActiveContainerSpace } from '@extension/tabbase-shared/lib/redux/features/tab/tab.slice'
import { Button, Group } from '@mantine/core'
import type React from 'react'

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const dispatch = useAppDispatch()

  const display = useAppSelector(selectContainersSpacesDisplay)

  return (
    <div style={{ padding: '10px' }}>
      <Group>
        {display.spaces.map(item => (
          <Button
            onClick={() => {
              dispatch(onActActiveContainerSpace({ activeContainerSpace: item.id }))
            }}
            variant={item.active ? 'filled' : 'light'}
            key={item.id}>
            {item.name}
          </Button>
        ))}
      </Group>
    </div>
  )
}

export default Header
