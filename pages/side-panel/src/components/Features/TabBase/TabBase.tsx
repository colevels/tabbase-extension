import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CollisionDetection, DropAnimation } from '@dnd-kit/core'
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
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'

import SortableItemCustom from './SortableItemCustom'
import DroppableContainer from './DroppableContainerGrid/DroppableContainer'

import { Item } from './SortableItemCustom/Item'

import styles from './TabBaseContainer.module.css'

import { useAppSelector, useAppDispatch } from '@extension/shared'
import { onActPinTab, updateItems } from '@extension/shared/lib/redux/features/tab/tab.slice'
import { selectContainersSpacesDisplay } from '@extension/shared/lib/redux/features/tab/tab.selector'

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

export const TRASH_ID = 'void'

const MultipleContainers: React.FC = () => {
  const dispatch = useAppDispatch()

  const { containers, tabsMap } = useAppSelector(selectContainersSpacesDisplay)

  const containerId = 'tabs'
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(MouseSensor))

  const lastOverId = useRef<string | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

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
      if (activeId && activeId in containers) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => container.id in containers),
        })
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args)
      const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections
        }

        if (overId in containers) {
          const containerItems = containers[overId]

          // If a container is matched and it contains items (columns 'A', 'pinTabs', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                container => container.id !== overId && containerItems.includes(container.id.toString()),
              ),
            })[0]?.id
          }
        }

        lastOverId.current = overId.toString()

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
    [activeId, containers],
  )

  const findContainer = (id: string) => {
    if (id in containers) {
      return id
    }

    return Object.keys(containers).find(key => containers[key].includes(id.toString()))
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [containers])

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
        setActiveId(active.id.toString())
      }}
      onDragOver={({ active, over }) => {
        console.log('active and over: ', { active, over })

        const overId = over?.id

        if (overId == null || overId === TRASH_ID || active.id in containers) {
          return
        }

        const overContainer = findContainer(overId.toString())
        const activeContainer = findContainer(active.id.toString())
        console.log({ overContainer, activeContainer })

        if (!overContainer || !activeContainer) {
          return
        }

        if (activeContainer !== overContainer) {
          console.log('over container')

          const activeItems = containers[activeContainer]
          const overItems = containers[overContainer]
          const overIndex = overItems.indexOf(overId.toString())
          const activeIndex = activeItems.indexOf(active.id.toString())

          let newIndex: number

          if (overId in containers) {
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

          console.log({
            activeContainer,
            overContainer,
          })

          // const pinTabIndex = _.findIndex([activeContainer, overContainer])
          // console.log('pinTabIndex', pinTabIndex)

          if (activeContainer === 'pinTabs' && overContainer !== 'pinTabs') {
            const tabId = containers[activeContainer][activeIndex]
            dispatch(onActPinTab({ tabId }))
          }

          if (activeContainer !== 'pinTabs' && overContainer === 'pinTabs') {
            const tabId = containers[activeContainer][activeIndex]
            dispatch(onActPinTab({ tabId }))
          }

          dispatch(
            updateItems({
              id: activeContainer,
              items: containers[activeContainer].filter(item => item !== active.id),
            }),
          )

          dispatch(
            updateItems({
              id: overContainer,
              items: [
                ...containers[overContainer].slice(0, newIndex),
                containers[activeContainer][activeIndex],
                ...containers[overContainer].slice(newIndex, containers[overContainer].length),
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

        if (active.id in containers && over?.id) {
          // setContainers(containers => {
          //   const activeIndex = containers.indexOf(active.id)
          //   const overIndex = containers.indexOf(over.id)

          //   return arrayMove(containers, activeIndex, overIndex)
          // })

          console.log('set containers')
        }

        const activeContainer = findContainer(active.id.toString())

        if (!activeContainer) {
          setActiveId(null)
          return
        }

        const overId = over?.id

        if (overId == null) {
          setActiveId(null)
          return
        }

        // if (overId === TRASH_ID) {
        //   // setItems(items => ({
        //   //   ...items,
        //   //   [activeContainer]: items[activeContainer].filter(id => id !== activeId),
        //   // }))
        //   setActiveId(null)
        //   console.log('trash')
        //   return
        // }

        const overContainer = findContainer(overId.toString())

        if (overContainer) {
          const activeIndex = containers[activeContainer].indexOf(active.id.toString())
          const overIndex = containers[overContainer].indexOf(overId.toString())

          if (activeIndex !== overIndex) {
            console.log('over container')
            dispatch(
              updateItems({ id: overContainer, items: arrayMove(containers[overContainer], activeIndex, overIndex) }),
            )
          }
        }

        setActiveId(null)
      }}>
      <div className={styles.TabBaseContainer}>
        <div style={{ padding: '0px 20px 0px 20px' }}>
          <div>CONTAINER: TABS</div>
        </div>
        <DroppableContainer key={'pinTabs'} id={'pinTabs'} items={containers['pinTabs']}>
          <SortableContext items={containers['pinTabs']} strategy={verticalListSortingStrategy}>
            {containers['pinTabs'].map((value, index) => {
              return <SortableItemCustom tab={tabsMap[value]} key={value} id={value} index={index} handle={false} />
            })}
          </SortableContext>
        </DroppableContainer>
      </div>

      <div className={styles.TabBaseContainer}>
        <div style={{ padding: '0px 20px 0px 20px' }}>
          <div>CONTAINER: TABS</div>
        </div>
        <DroppableContainer key={containerId} id={containerId} items={containers[containerId]}>
          <SortableContext items={containers[containerId]} strategy={verticalListSortingStrategy}>
            {containers[containerId].map((value, index) => {
              return <SortableItemCustom tab={tabsMap[value]} key={value} id={value} index={index} handle={false} />
            })}
          </SortableContext>
        </DroppableContainer>
      </div>

      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeId ? renderSortableItemDragOverlay(activeId) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )

  function renderSortableItemDragOverlay(id: string) {
    return <Item dragOverlay value={<div>{tabsMap[id].title || id}</div>} />
  }
}

export default MultipleContainers
