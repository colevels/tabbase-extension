import React, { forwardRef } from 'react'
import classNames from 'classnames'
import { Stack } from '@mantine/core'
import styled from 'styled-components'

import styles from './Container.module.css'

export interface Props {
  children: React.ReactNode

  style?: React.CSSProperties
  hover?: boolean
  onClick?(): void
}

const StyledStack = styled(Stack)`
  ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgb(200, 200, 200);
    border-radius: 12px;
  }

  ::-webkit-scrollbar-track {
    background: rgb(233, 233, 235);
    border-radius: 12px;
  }
`

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
        <StyledStack
          style={{
            padding: '0 5px 0 0',
            overflowY: 'scroll',
            // background: '#f5f5f7',
            // borderRadius: '12px',
            height: '300px',
            minHeight: '38px',
            // height: _.get(recentTabHeightConfig, `${setting.maximumRecentTabs}`, null) || recentTabHeightConfig.full,
          }}>
          {children}
        </StyledStack>
      </div>
    )
  },
)

Container.displayName = 'Container'
