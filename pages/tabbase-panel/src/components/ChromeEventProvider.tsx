import { useAppDispatch } from '@extension/tabbase-shared'
import {
  onActGetTabs,
  onActTabCreated,
  onActTabRemoved,
  onActTabGroupCreated,
  onActTabGroupDeleted,
  onActTabGroupUpdated,
  onActTabUpdated,
  onActGetTabGroups,
  onActGetWindows,
  onActTabActivated,
  onActSetContext,
} from '@extension/tabbase-shared/lib/redux/features/tab/tab.slice'
import React, { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}

const ChromeEventProvider: React.FC<Props> = props => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // PREPARE
    dispatch(onActSetContext())
    dispatch(onActGetTabs())
    dispatch(onActGetTabGroups())
    dispatch(onActGetWindows())
  }, [dispatch])

  const handleTabUpdated = React.useCallback(
    (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      console.log('event: update tab', { tabId, changeInfo, tab })
      dispatch(onActTabUpdated({ tabId, changeInfo, tab }))
    },
    [dispatch],
  )

  const handleTabDeleted = React.useCallback(
    (tabId: number, _removeInfo: chrome.tabs.TabRemoveInfo) => {
      console.log('event: remove tab', tabId, _removeInfo)
      dispatch(onActTabRemoved({ tabId }))
    },
    [dispatch],
  )

  const handleTabCreated = React.useCallback(
    (tab: chrome.tabs.Tab) => {
      console.log('event: create tab', tab)
      dispatch(onActTabCreated({ tab }))
    },
    [dispatch],
  )

  const handleTabGroupCreated = React.useCallback(
    (tabGroup: chrome.tabGroups.TabGroup) => {
      console.log('event: tab group created', tabGroup)
      dispatch(onActTabGroupCreated({ tabGroup: tabGroup }))
    },
    [dispatch],
  )

  const handleTabGroupUpdated = React.useCallback(
    (tabGroup: chrome.tabGroups.TabGroup) => {
      console.log('event: tab group updated', tabGroup)
      dispatch(onActTabGroupUpdated({ tabGroup }))
    },
    [dispatch],
  )

  const handleTabGroupDeleted = React.useCallback(
    (tabGroup: chrome.tabGroups.TabGroup) => {
      console.log('event: tab group removed', tabGroup)
      dispatch(onActTabGroupDeleted({ tabGroup }))
    },
    [dispatch],
  )

  const handleTabActivated = React.useCallback(
    (activeInfo: chrome.tabs.TabActiveInfo) => {
      console.log('event: tab activated', activeInfo)
      dispatch(onActTabActivated({ activeInfo }))
    },
    [dispatch],
  )

  const handleTabMoved = React.useCallback(
    (tabId: number, moveInfo: chrome.tabs.TabMoveInfo) => {
      console.log('event: tab moved', { tabId, moveInfo })
      return true
    },
    [dispatch],
  )

  useEffect(() => {
    chrome.tabs.onUpdated.addListener(handleTabUpdated)
    chrome.tabs.onRemoved.addListener(handleTabDeleted)
    chrome.tabs.onCreated.addListener(handleTabCreated)

    chrome.tabGroups.onCreated.addListener(handleTabGroupCreated)
    chrome.tabGroups.onUpdated.addListener(handleTabGroupUpdated)
    chrome.tabGroups.onRemoved.addListener(handleTabGroupDeleted)

    chrome.tabs.onActivated.addListener(handleTabActivated)
    chrome.tabs.onMoved.addListener(handleTabMoved)

    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdated)
      chrome.tabs.onRemoved.removeListener(handleTabDeleted)
      chrome.tabs.onCreated.removeListener(handleTabCreated)
      chrome.tabGroups.onCreated.removeListener(handleTabGroupCreated)
      chrome.tabGroups.onUpdated.removeListener(handleTabGroupUpdated)
      chrome.tabGroups.onRemoved.removeListener(handleTabGroupDeleted)
      chrome.tabs.onActivated.removeListener(handleTabActivated)
      chrome.tabs.onMoved.removeListener(handleTabMoved)
    }
  }, [
    handleTabUpdated,
    handleTabDeleted,
    handleTabCreated,
    handleTabGroupCreated,
    handleTabGroupDeleted,
    handleTabGroupUpdated,
    handleTabActivated,
    handleTabMoved,
  ])

  return <div>{props.children}</div>
}

export default ChromeEventProvider
