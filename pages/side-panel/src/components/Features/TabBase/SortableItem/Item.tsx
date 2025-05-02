import React, { useEffect } from 'react'
import classNames from 'classnames'
import styles from './Item.module.scss'
import { Handle } from '../Handle/Handle'

import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'

export interface Props {
  dragOverlay?: boolean
  disabled?: boolean

  dragging?: boolean
  handle?: boolean
  handleProps?: any

  index?: number

  fadeIn?: boolean

  transform?: Transform | null
  listeners?: DraggableSyntheticListeners

  sorting?: boolean
  style?: React.CSSProperties

  transition?: string | null

  wrapperStyle?: React.CSSProperties
  value: React.ReactNode
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        index,
        listeners,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
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
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition].filter(Boolean).join(', '),
              '--translate-x': transform ? `${Math.round(transform.x)}px` : undefined,
              '--translate-y': transform ? `${Math.round(transform.y)}px` : undefined,
              '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
              '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
              '--index': index,
              // '--color': color,
            } as React.CSSProperties
          }
          ref={ref}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <div>
              <span className={styles.Actions}>{handle ? <Handle {...handleProps} {...listeners} /> : null}</span>
            </div>
            <div
              className={classNames(
                styles.Item,
                dragging && styles.dragging,
                handle && styles.withHandle,
                dragOverlay && styles.dragOverlay,
                disabled && styles.disabled,
                // color && styles.color,
              )}
              style={{ ...style, width: '100%' }}
              {...(!handle ? listeners : undefined)}
              {...props}
              tabIndex={!handle ? 0 : undefined}>
              {value}
            </div>
          </div>
        </li>
      )
    },
  ),
)
