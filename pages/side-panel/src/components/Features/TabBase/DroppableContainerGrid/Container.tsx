import React, { forwardRef } from 'react'
import classNames from 'classnames'

import styles2 from './GridContainer.module.css'
import styles from './Container.module.css'

export interface Props {
  children: React.ReactNode

  style?: React.CSSProperties
  hover?: boolean
  onClick?(): void
}

export const Container = forwardRef<HTMLDivElement, Props>(
  ({ children, hover, style, onClick, ...props }: Props, ref) => {
    return (
      <div
        {...props}
        aria-hidden
        ref={ref}
        style={{ ...style }}
        className={classNames(styles.Container, hover && styles.hover)}
        onClick={onClick}>
        <ul
          className={styles2.GridContainer}
          style={
            {
              '--col-count': 5,
            } as React.CSSProperties
          }>
          {children}
        </ul>
      </div>
    )
  },
)

Container.displayName = 'Container'
