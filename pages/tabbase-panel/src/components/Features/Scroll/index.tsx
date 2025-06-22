import React from 'react'
import type { VisibilityContext } from 'react-horizontal-scrolling-menu'
import { ScrollMenu } from 'react-horizontal-scrolling-menu'
import 'react-horizontal-scrolling-menu/dist/styles.css'
import './index.css'

import { Box, Text } from '@mantine/core'
import { LeftArrow, RightArrow } from './Arrows'

type ScrollVisibilityApiType = React.ContextType<typeof VisibilityContext>

type Props = {
  items: any[]
  onClick?: (id: string) => void
  activeId?: string
}

const ScrollContent: React.FC<Props> = props => {
  const apiRef = React.useRef({} as ScrollVisibilityApiType)

  const onWheel = (apiObj: ScrollVisibilityApiType, ev: React.WheelEvent) => {
    const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15

    if (isThouchpad) {
      ev.stopPropagation()
      return
    }

    if (ev.deltaY < 0) {
      apiObj.scrollNext()
    } else if (ev.deltaY > 0) {
      apiObj.scrollPrev()
    }
  }

  return (
    <div style={{ position: 'relative', padding: '0px' }}>
      <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow} onWheel={onWheel} apiRef={apiRef}>
        {props.items.map(o => (
          <Box
            px={8}
            py={5}
            mr={4}
            h={'40px'}
            style={{
              cursor: 'pointer',
              display: 'inline-block',
              position: 'relative',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            bg={props.activeId === o.id ? '#a5a5a5' : '#ebebeb'}
            onClick={() => {
              if (props.onClick) {
                props.onClick(o.id)
              }
            }}>
            <Text className="title">{o.id}</Text>
          </Box>
        ))}
      </ScrollMenu>
    </div>
  )
}

export default ScrollContent
