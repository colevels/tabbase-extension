import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import styled from 'styled-components'

import { Handle } from '../Handle/Handle'
import { Item } from './Item'
import { Tab } from './Tab'

import type { UniqueIdentifier } from '@dnd-kit/core'
import type { TabExtend } from '@extension/shared'

interface SortableItemProps {
  id: UniqueIdentifier
  index: number
  handle: boolean
  disabled?: boolean
  tab?: TabExtend
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
`

function SortableItem({ disabled, id, index, handle, tab }: SortableItemProps) {
  const { setNodeRef, setActivatorNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
    id,
  })
  const mounted = useMountStatus()
  const mountedWhileDragging = isDragging && !mounted

  return (
    <Tab
      handle={handle}
      index={index}
      // value={<div style={{ fontSize: 20 }} >{tab ? `${tab.title} : ${id}` : id}</div>}
      value={tab ? tab.title : id}
      ref={disabled ? undefined : setNodeRef}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      dragging={isDragging}
      sorting={isSorting}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      title={tab ? tab.title : id}
      onSelect={() => {}}
      onClose={() => {}}
    />
  )
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500)

    return () => clearTimeout(timeout)
  }, [])

  return isMounted
}

export default SortableItem
