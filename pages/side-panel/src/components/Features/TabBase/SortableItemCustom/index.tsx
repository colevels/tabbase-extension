import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { Item } from './Item'

import type React from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'
import type { TabExtend } from '@extension/shared'

interface SortableItemProps {
  containerId: UniqueIdentifier
  id: UniqueIdentifier
  index: number
  handle: boolean
  disabled?: boolean

  style(args: any): React.CSSProperties
  getIndex(id: UniqueIdentifier): number
  wrapperStyle({ index }: { index: number }): React.CSSProperties
  tab?: TabExtend
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  style,
  containerId,
  getIndex,
  wrapperStyle,
  tab,
}: SortableItemProps) {
  // console.log('SortableItem', id, index, tab)
  const { setNodeRef, setActivatorNodeRef, listeners, isDragging, isSorting, over, overIndex, transform, transition } =
    useSortable({
      id,
    })
  const mounted = useMountStatus()
  const mountedWhileDragging = isDragging && !mounted

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={<div>{tab ? tab.title : id}</div>}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
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
