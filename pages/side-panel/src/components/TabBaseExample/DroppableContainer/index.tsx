import React from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'
import type { AnimateLayoutChanges } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'

import { Container } from '../Container/Container'
import type { Props as ContainerProps } from '../Container/Container'

const animateLayoutChanges: AnimateLayoutChanges = args => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

function DroppableContainer({
  children,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  id: UniqueIdentifier
  items: UniqueIdentifier[]
  style?: React.CSSProperties
}) {
  const { active, over, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  })
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
    : false

  return (
    <Container
      ref={setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      hover={isOverContainer}
      {...props}>
      {children}
    </Container>
  )
}

export default DroppableContainer
