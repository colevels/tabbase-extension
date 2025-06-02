import React from 'react'
import type { VisibilityContext } from 'react-horizontal-scrolling-menu'
import { ScrollMenu } from 'react-horizontal-scrolling-menu'
import 'react-horizontal-scrolling-menu/dist/styles.css'
import './index.css'

import { Box, Text } from '@mantine/core'
import { LeftArrow, RightArrow } from './Arrows'

// import { TabFilter } from '../../../../type'

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>

type Props = {
  tabFilters: any[]
  // onSelectTabFilter: (tabFilter: TabFilter) => void
  // onNewTabFilter: () => void
  // activeTabFeedId: string | null
}

const ScrollContent: React.FC<Props> = props => {
  const apiRef = React.useRef({} as scrollVisibilityApiType)

  console.log('props.', props)

  const onWheel = (apiObj: scrollVisibilityApiType, ev: React.WheelEvent) => {
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
        {props.tabFilters.map(tabFilter => (
          <Box
            px={8}
            py={5}
            mr={4}
            bg={'#ebebeb'}
            onClick={() => {
              // props.onClick()
            }}>
            <Text className="title">{tabFilter.id}</Text>
          </Box>
        ))}
      </ScrollMenu>
    </div>
  )
}

export default ScrollContent
