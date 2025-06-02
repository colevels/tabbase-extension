import React from 'react'
import { Avatar, Indicator, Stack } from '@mantine/core'
import _ from 'lodash'
import styled from 'styled-components'

interface StyledTabProps {
  active?: boolean
  disabled?: boolean
  animated?: boolean
  discarded?: boolean
}

type ExtensionInfo = {
  host: string | null
  deleted?: boolean
}

interface TabExtend extends chrome.tabs.Tab {
  id: number
  key?: number
  _ex: ExtensionInfo
}

type TabExtendWithNextTabId = TabExtend & {
  nextTabId: number
  active: boolean
}

const StyledTab = styled.div<StyledTabProps>`
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 6px 6px 6px 8px;
  border-radius: 10px;
  border-style: ${props => (props.discarded ? 'dashed !important' : 'solid')};
  border-color: ${props => (props.discarded ? '#c8c8c8 !important' : '#e7e7e7')};
  opacity: ${props => (props.disabled ? 0.5 : props.discarded ? 0.65 : 1)};

  margin-bottom: 0px;
  background-color: ${props => (props.active ? 'rgb(216, 255, 109)' : 'rgba(255, 255, 255, 0.8)')};
  border: ${props => (props.active ? '1px solid #ddd' : '1px solid #e7e7e7')};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  height: 24px;
  min-height: 24px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  cursor: ${props => (props.disabled ? 'default' : 'pointer')};

  .containerTitle {
  }

  transform: scale(1);
  transition-duration: 0.1s;

  :active {
    transform: ${props => (props.animated ? 'scale(0.99)' : undefined)};
    transition-duration: 0.1s;
  }

  :hover {
    background-color: ${props => (props.active ? 'rgb(216, 255, 109)' : '#fff')};

    .action {
      display: flex !important;
    }

    .title {
      color: #000000;
    }

    .containerTitle {
      width: calc(100% - 26px - 26px - 20px) !important;
    }
  }

  :last-child {
    margin-bottom: 0px;
  }
`

const StyledStack = styled(Stack)`
  /* custom */
  flex-grow: 1;

  :last-child {
    margin-bottom: 0px;
  }
`

const ContainerTitle = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`

const Title = styled.div<StyledTabProps>`
  font-size: 13px;
  line-height: 24px;
  color: ${props => (props.active ? '#000000' : '#333')};
  font-weight: ${props => (props.active ? '500' : '500')};
  user-select: none;
  padding-right: 2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;

  :hover {
    color: ${props => (props.active ? '#000000' : '#000000')};
  }
`

const MiniMenu = styled.div`
  flex-direction: row;
  display: flex;
  margin-left: auto;
`

const MiniMenu2 = styled.div`
  flex-direction: row;
  display: flex;
  margin-left: 2px;
`

const MiniMenuTool = styled.span`
  padding: 2px;
  display: none;
  align-items: center;
  border-radius: 5px;

  transform: scale(1);
  transition-duration: 0.2s;

  :active {
    transform: scale(0.95);
    transition-duration: 0.15s;
  }

  :hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`

type Props = {
  // tab: TabExtendWithNextTabId
  title: string | React.ReactNode
  active?: boolean
  disabled?: boolean
  onSelect: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onClose?: () => void
  onSave?: () => void
  onOpenTabNote?: () => void
  onFavorite?: () => void
}

// example title: (12) Youtube
const removeNotificationText = (title: string): string => {
  const regex = /\(\d+\)/
  const match = title.match(regex)
  let titleFormat = title

  if (titleFormat.endsWith(' - YouTube')) {
    titleFormat = titleFormat.replace(' - YouTube', '')
  }

  if (match) {
    return titleFormat.replace(match[0], '').replace(' • Instagram photos and videos', '').trim()
  }

  // return title.replace(' • Instagram photos and videos', '')
  return titleFormat.replace(' • Instagram photos and videos', '')
}

const Tab: React.FC<Props> = props => {
  const [closing, setClosing] = React.useState<boolean>(false)

  return (
    <StyledStack gap={5} mb={5}>
      <Indicator disabled position="top-start" offset={2}>
        <StyledTab
          // discarded={props.tab.discarded}
          active={props.active}
          disabled={props.disabled}
          animated={!closing}
          onMouseUpCapture={() => {
            setClosing(false)
          }}
          onMouseDownCapture={e => {
            // this is to prevent the tab from being selected when the close button is clicked
            if (
              _.get(e, 'target.id') === 'close-tab' ||
              _.get(e, 'target.id') === 'save-icon' ||
              _.get(e, 'target.id') === 'star-icon' ||
              _.get(e, 'target.nodeName') === 'path'
            ) {
              setClosing(true)
              e.stopPropagation()
            }
          }}
          onMouseDown={async e => {
            if (e.buttons !== 2) {
              props.onSelect(e)
            }
          }}
          onMouseEnter={() => {
            if (closing) {
              setClosing(false)
            }
          }}>
          <ContainerTitle className="containerTitle">
            {/* <Avatar
              size="xs"
              src={favicon}
              mr={8}
              radius={0}
              styles={{
                root: { backgroundColor: 'transparent' },
                placeholder: { backgroundColor: 'transparent' },
                placeholderIcon: { backgroundColor: 'transparent' },
              }}>
              <FileIcon
                style={{ marginBottom: favicon ? 0 : '2px', width: '16px', height: '16px' }}
                color={props.active ? '#000' : '#111111'}
              />
            </Avatar> */}

            <Title className="title" active={props.active}>
              {/* {props.tab.title ? removeNotificationText(props.tab.title) : props.tab.pendingUrl} */}
              {props.title}
            </Title>
          </ContainerTitle>
          {props.onClose && (
            <MiniMenu2>
              <MiniMenuTool
                id="close-tab"
                className="action"
                onMouseDown={() => {
                  setClosing(true)
                }}
                onClick={e => {
                  e.stopPropagation()
                  if (props.onClose) {
                    props.onClose()
                  }
                }}>
                {/* <Cross2Icon id="close-tab" width={20} height={20} style={{ color: '#000000', pointerEvents: 'none' }} /> */}
                <div>X</div>
              </MiniMenuTool>
            </MiniMenu2>
          )}
        </StyledTab>
      </Indicator>
    </StyledStack>
  )
}

export default React.memo(Tab, (prevProps, nextProps) => {
  // if (prevProps.tab.discarded !== nextProps.tab.discarded) {
  //   return false
  // }

  // if (prevProps.active !== nextProps.active) {
  //   return false
  // }

  // if (prevProps.tab.title !== nextProps.tab.title) {
  //   return false
  // }

  // if (prevProps.tab.nextTabId !== nextProps.tab.nextTabId) {
  //   return false
  // }

  // if (prevProps.tab.url !== nextProps.tab.url) {
  //   return false
  // }

  // if (prevProps.tab.favIconUrl !== nextProps.tab.favIconUrl) {
  //   return false
  // }

  return true
})
