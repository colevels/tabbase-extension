import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  CancelDrop,
  CollisionDetection,
  DropAnimation,
  UniqueIdentifier,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core'
import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  useSensors,
  useSensor,
  DndContext,
  DragOverlay,
  getFirstCollision,
  defaultDropAnimationSideEffects,
  MouseSensor,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable'

import SortableItemCustom from '../SortableItemCustom'
import DroppableContainerGrid from '../DroppableContainerGrid'

import styles from '../TabBaseContainer.module.css'

import { useAppSelector, useAppDispatch } from '@extension/shared'
import { onActPinTab, updateItems } from '@extension/shared/lib/redux/features/tab/tab.slice'
import { selectContainersSpacesDisplay } from '@extension/shared/lib/redux/features/tab/tab.selector'

type Props = {
  containers: Record<string, UniqueIdentifier[]>
  tabsMap: Record<UniqueIdentifier, any>
  style(args: any): React.CSSProperties
  getItemStyles(args: {
    value: UniqueIdentifier
    index: number
    overIndex: number
    isDragging: boolean
    containerId: string
    isSorting: boolean
    isDragOverlay: boolean
    background?: string
  }): React.CSSProperties
  wrapperStyle(args: { index: number }): React.CSSProperties

  getIndex(id: UniqueIdentifier): number
}

const GridContainer: React.FC<Props> = props => {
  return (
    <div>
      <div>CONTAINER: PIN TABS</div>
      <div className={styles.TabBaseContainer}>
        <DroppableContainerGrid key={'pinTabs'} id={'pinTabs'} items={props.containers['pinTabs']}>
          <SortableContext items={props.containers['pinTabs']} strategy={rectSortingStrategy}>
            {props.containers['pinTabs'].map((value, index) => {
              return (
                <SortableItemCustom
                  containerId={'pinTabs'}
                  tab={props.tabsMap[value]}
                  key={value}
                  id={value}
                  index={index}
                  handle={false}
                  style={props.getItemStyles}
                  wrapperStyle={props.wrapperStyle}
                  getIndex={props.getIndex}
                />
              )
            })}
          </SortableContext>
        </DroppableContainerGrid>
      </div>
    </div>
  )
}

export default GridContainer
