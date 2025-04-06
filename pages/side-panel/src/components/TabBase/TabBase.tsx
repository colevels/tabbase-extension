import React, { useCallback, useEffect, useRef, useState } from 'react'
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

import { createRange } from './utils'

import SortableItem from './SortableItem'
import SortableItemPin from './SortableItemPin'
import DroppableContainer from './DroppableContainer'
import { GridContainer } from './GridContainer'
import { Item } from './SortableItem/Item'
import { Item as ItemPin } from './SortableItemPin/Item'

import styles from './TabBaseContainer.module.css'
import { useAppSelector, useAppDispatch } from '@extension/shared'
import { updateItems } from '@extension/shared/lib/redux/features/tab/tab.slice'
// import { Button } from '@mantine/core'

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>

interface Props {
  adjustScale?: boolean
  cancelDrop?: CancelDrop
  columns?: number
  containerStyle?: React.CSSProperties
  coordinateGetter?: KeyboardCoordinateGetter
  getItemStyles?(args: {
    value: UniqueIdentifier
    index: number
    overIndex: number
    isDragging: boolean
    containerId: UniqueIdentifier
    isSorting: boolean
    isDragOverlay: boolean
    background?: string
  }): React.CSSProperties
  wrapperStyle?(args: { index: number }): React.CSSProperties
  itemCount?: number
  items?: Items
  handle?: boolean
  scrollable?: boolean
}

export const TRASH_ID = 'void'

export function MultipleContainers({
  adjustScale = false,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
}: Props) {
  const dispatch = useAppDispatch()
  const { items, containers } = useAppSelector(state => {
    return {
      containers: state.tab.containersIds,
      items: state.tab.containers,
    }
  })
  let containerId = 'tabs'
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  // const isSortingContainer = activeId != null ? containers.includes(activeId) : false

  const onClick = () => {
    dispatch(updateItems({ id: 'pinTabs', items: ['B1', 'B7', 'B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B9', 'B10'] }))
  }

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    args => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => container.id in items),
        })
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections
        }

        if (overId in items) {
          const containerItems = items[overId]

          // If a container is matched and it contains items (columns 'A', 'pinTabs', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                container => container.id !== overId && containerItems.includes(container.id),
              ),
            })[0]?.id
          }
        }

        lastOverId.current = overId

        return [{ id: overId }]
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, items],
  )
  const [clonedItems, setClonedItems] = useState<Items | null>(null)
  const sensors = useSensors(useSensor(MouseSensor))

  const findContainer = (id: UniqueIdentifier, source?: string) => {
    console.log('source', source)
    if (id in items) {
      console.log('x1')
      return id
    }

    console.log('x2')
    return Object.keys(items).find(key => items[key].includes(id))
  }

  const getIndex = (id: UniqueIdentifier) => {
    console.log('get index', id)
    const container = findContainer(id)

    if (!container) {
      return -1
    }

    const index = items[container].indexOf(id)

    return index
  }

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      // setItems(clonedItems)
      console.log('on drag cancel')
    }

    setActiveId(null)
    setClonedItems(null)
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [items])

  // const containerId = containers[0]

  console.log('items', items)
  console.log('items[containerId]', items[containerId])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id)
        setClonedItems(items)
      }}
      onDragOver={({ active, over }) => {
        console.log('ondrag over')
        const overId = over?.id
        console.log('over id: ', overId)
        console.log('active id: ', active.id)

        if (overId == null || overId === TRASH_ID || active.id in items) {
          return
        }

        const overContainer = findContainer(overId)
        const activeContainer = findContainer(active.id)

        if (!overContainer || !activeContainer) {
          return
        }

        console.log({ overContainer, activeContainer })

        if (activeContainer !== overContainer) {
          console.log('over container')

          const activeItems = items[activeContainer]
          const overItems = items[overContainer]
          const overIndex = overItems.indexOf(overId)
          const activeIndex = activeItems.indexOf(active.id)

          let newIndex: number

          if (overId in items) {
            newIndex = overItems.length + 1
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height

            const modifier = isBelowOverItem ? 1 : 0

            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
          }

          recentlyMovedToNewContainer.current = true

          dispatch(
            updateItems({
              id: activeContainer,
              items: items[activeContainer].filter(item => item !== active.id),
            }),
          )

          dispatch(
            updateItems({
              id: overContainer,
              items: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(newIndex, items[overContainer].length),
              ],
            }),
          )

          // setItems(items => {
          //   const activeItems = items[activeContainer]
          //   const overItems = items[overContainer]
          //   const overIndex = overItems.indexOf(overId)
          //   const activeIndex = activeItems.indexOf(active.id)

          //   let newIndex: number

          //   if (overId in items) {
          //     newIndex = overItems.length + 1
          //   } else {
          //     const isBelowOverItem =
          //       over &&
          //       active.rect.current.translated &&
          //       active.rect.current.translated.top > over.rect.top + over.rect.height

          //     const modifier = isBelowOverItem ? 1 : 0

          //     newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
          //   }

          //   recentlyMovedToNewContainer.current = true

          //   return {
          //     ...items,
          //     [activeContainer]: items[activeContainer].filter(item => item !== active.id),
          //     [overContainer]: [
          //       ...items[overContainer].slice(0, newIndex),
          //       items[activeContainer][activeIndex],
          //       ...items[overContainer].slice(newIndex, items[overContainer].length),
          //     ],
          //   }
          // })
        }
      }}
      onDragEnd={({ active, over }) => {
        console.log('on drag end', { active, over })

        if (active.id in items && over?.id) {
          // setContainers(containers => {
          //   const activeIndex = containers.indexOf(active.id)
          //   const overIndex = containers.indexOf(over.id)

          //   return arrayMove(containers, activeIndex, overIndex)
          // })

          console.log('set containers')
        }

        const activeContainer = findContainer(active.id)

        if (!activeContainer) {
          setActiveId(null)
          return
        }

        const overId = over?.id

        if (overId == null) {
          setActiveId(null)
          return
        }

        if (overId === TRASH_ID) {
          // setItems(items => ({
          //   ...items,
          //   [activeContainer]: items[activeContainer].filter(id => id !== activeId),
          // }))
          setActiveId(null)
          console.log('trash')
          return
        }

        const overContainer = findContainer(overId)

        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id)
          const overIndex = items[overContainer].indexOf(overId)

          if (activeIndex !== overIndex) {
            console.log('over container')
            dispatch(updateItems({ id: overContainer, items: arrayMove(items[overContainer], activeIndex, overIndex) }))
            // setItems(items => ({
            //   ...items,
            //   [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
            // }))
          }
        }

        setActiveId(null)
      }}
      onDragCancel={onDragCancel}>
      <div className={styles.TabBaseContainer}>
        <GridContainer columns={5}>
          <SortableContext items={items['pinTabs']} strategy={rectSortingStrategy}>
            {items['pinTabs'].map((value, index) => {
              return (
                <SortableItem
                  key={value}
                  id={value}
                  index={index}
                  handle={true}
                  style={getItemStyles}
                  wrapperStyle={wrapperStyle}
                  containerId={'pinTabs'}
                  getIndex={getIndex}
                />
              )
            })}
          </SortableContext>
        </GridContainer>
      </div>

      <div className={styles.TabBaseContainer}>
        <div style={{ padding: '0px 20px 0px 20px' }}>
          <div>PIN TAB BY WEBSITE</div>
        </div>
        <DroppableContainer
          key={containerId}
          id={containerId}
          // onRemove={() => handleRemove(containerId)}
          items={items[containerId]}>
          <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy}>
            {items[containerId].map((value, index) => {
              return (
                <SortableItem
                  key={value}
                  containerId={containerId}
                  id={value}
                  index={index}
                  // disabled={isSortingContainer}
                  handle={false}
                  style={getItemStyles}
                  wrapperStyle={wrapperStyle}
                  getIndex={getIndex}
                />
              )
            })}
          </SortableContext>
        </DroppableContainer>
      </div>

      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId ? renderSortableItemDragOverlay(activeId) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    console.log('renderSortableItemDragOverlay', id)
    if (id === 'B5') {
      return (
        <ItemPin
          value={id + 'VVS'}
          style={getItemStyles({
            containerId: findContainer(id, 'xx') as UniqueIdentifier,
            overIndex: -1,
            index: getIndex(id),
            background: 'red',
            value: id,
            isSorting: true,
            isDragging: true,
            isDragOverlay: true,
          })}
          wrapperStyle={wrapperStyle({ index: 0 })}
          dragOverlay
        />
      )
    }

    return (
      <Item
        value={id + 'x'}
        style={getItemStyles({
          containerId: findContainer(id, 'xx') as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          background: 'red',
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        wrapperStyle={wrapperStyle({ index: 0 })}
        dragOverlay
      />
    )
  }

  function handleRemove(containerID: UniqueIdentifier) {
    // setContainers(containers => containers.filter(id => id !== containerID))
    console.log('handle remove', containerID)
  }
}
