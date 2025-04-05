import React, { forwardRef } from 'react'
import classNames from 'classnames'

import styles from './Container.module.css'

export interface Props {
  children: React.ReactNode

  style?: React.CSSProperties
  hover?: boolean
  onClick?(): void
  onRemove?(): void
}

export const Container = forwardRef<HTMLDivElement, Props>(
  ({ children, hover, style, onRemove, onClick, ...props }: Props, ref) => {
    return (
      <div
        {...props}
        aria-hidden
        ref={ref}
        style={{ ...style }}
        className={classNames(styles.Container, hover && styles.hover)}
        onClick={onClick}>
        <ul>{children}</ul>
      </div>
    )
  },
)

Container.displayName = 'Container'
