import React from 'react'
import styled from 'styled-components'

import { VisibilityContext } from 'react-horizontal-scrolling-menu'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

const BaseArrow = styled.button`
  cursor: pointer;
  position: absolute;
  top: 0;
  height: 100%;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${props => (props.disabled ? 0 : 1)};
  user-select: 'none';
  height: 28px;
  border: none;
  pointer-events: ${props => (props.disabled ? 'none' : 'auto')};
`

const LeftButton = styled(BaseArrow)`
  left: 0;
  padding-right: 20px;
  /* deg */
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.09) 25%,
    rgba(255, 255, 255, 0.95) 50%,
    rgb(255, 255, 255) 75%
  );
`

const RightButton = styled(BaseArrow)`
  right: 0;
  padding-left: 20px;
  /* deg */
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.75) 25%,
    rgba(255, 255, 255, 0.9) 50%,
    rgb(255, 255, 255) 75%
  );
`

const Arrow = ({
  children,
  disabled,
  onClick,
  left,
}: {
  children: React.ReactNode
  disabled: boolean
  onClick: VoidFunction
  left?: boolean
}) => {
  if (left) {
    return (
      <LeftButton disabled={disabled} onClick={onClick}>
        {children}
      </LeftButton>
    )
  }

  return (
    <RightButton disabled={disabled} onClick={onClick}>
      {children}
    </RightButton>
  )
}

export const LeftArrow = () => {
  const visibility = React.useContext(VisibilityContext)

  const isFirstItemVisible = visibility.useIsVisible('first', true)

  return (
    <Arrow left disabled={isFirstItemVisible} onClick={() => visibility.scrollPrev()}>
      <ChevronLeftIcon style={{ width: '20px', height: '20px' }} />
    </Arrow>
  )
}

export const RightArrow = () => {
  const visibility = React.useContext(VisibilityContext)

  const isFirstItemVisible = visibility.useIsVisible('last', true)

  return (
    <Arrow disabled={isFirstItemVisible} onClick={() => visibility.scrollNext()}>
      <ChevronRightIcon style={{ width: '20px', height: '20px' }} />
    </Arrow>
  )
}
