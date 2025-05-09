import React, { useEffect } from 'react'
import classNames from 'classnames'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import { Handle } from '../Handle/Handle'
import styles from './Item.module.scss'

import Test from '../../../Common/Test'
import Tab from '../Tab'

export interface Props {
  dragOverlay?: boolean
  color?: string
  disabled?: boolean
  dragging?: boolean
  handle?: boolean
  handleProps?: any
  height?: number
  index?: number
  fadeIn?: boolean
  transform?: Transform | null
  listeners?: DraggableSyntheticListeners
  sorting?: boolean
  // style?: React.CSSProperties
  transition?: string | null
  value: React.ReactNode
  onRemove?(): void
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,

        index,
        listeners,
        sorting,
        // style,
        transition,
        transform,
        value,
        ...props
      },
      ref,
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return
        }

        document.body.style.cursor = 'grabbing'

        return () => {
          document.body.style.cursor = ''
        }
      }, [dragOverlay])

      return (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay,
          )}
          style={
            {
              transition: [transition].filter(Boolean).join(', '),
              '--translate-x': transform ? `${Math.round(transform.x)}px` : undefined,
              '--translate-y': transform ? `${Math.round(transform.y)}px` : undefined,
              '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
              '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
              '--index': index,
            } as React.CSSProperties
          }
          ref={ref}>
          <div
            style={{
              display: 'flex',
              // alignItems: 'center',
              // justifyContent: 'space-between',
              width: '100%',
            }}>
            <div className={classNames(styles.ActionsContainer, dragOverlay && styles.dragOverlay)}>
              <span className={styles.Actions}>
                <Handle {...handleProps} {...listeners} />
              </span>
            </div>
            <Tab title={value} onSelect={() => {}} onClose={() => {}} />

            {/* <div
              className={classNames(
                styles.Item,
                dragging && styles.dragging,
                handle && styles.withHandle,
                dragOverlay && styles.dragOverlay,
                disabled && styles.disabled,
                color && styles.color,
              )}
              style={{ width: '100%' }}
              {...props}
              // {...(!handle ? listeners : undefined)}
              tabIndex={handle ? undefined : 0}>
              <div className={styles.title}>{value}</div>
              <Test />
              <div>
                <div>Close Tab</div>
              </div>
            </div> */}
          </div>
        </li>
      )
    },
  ),
)
