// features/cart/cartSelectors.ts
import _ from 'lodash'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store.js'

// Input selector: Access the `items` from the cart slice
const selectTabs = (state: RootState) => state.tab.tabs
const selectTabGroups = (state: RootState) => state.tab.tabGroups
const selectTabsMap = (state: RootState) => state.tab.tabsMap
const selectContext = (state: RootState) => state.tab.context
const selectSpaces = (state: RootState) => state.tab.spaces

// Memoized selector: Calculate the total price of items in the cart
export const selectTabsList = createSelector(
  [selectTabs, selectTabGroups, selectTabsMap, selectContext], // Input selectors
  (items, tabGroups, tabsMap, context) => {
    const tabs = Object.values(tabsMap).map(tab => {
      return {
        ...tab,
        active: tab.id === context.tabId,
      }
    })

    return { tabs: _.sortBy(tabs, 'index') }
  }, // Result function
)

export const selectActiveSpace = createSelector(
  [selectSpaces, selectContext, selectTabsMap],
  (spaces, context, tabsMap) => {
    if (context.tabId) {
      const domain = tabsMap[context.tabId]?._ex?.host

      if (domain) {
        return spaces.find(space => space.domain === domain)
      }
    }

    return null
  },
)

export const selectSameDomainContainer = createSelector(
  [selectSpaces, selectContext, selectTabsMap],
  (spaces, context, tabsMap) => {
    // find current tab on window
    const tabsArray = Object.values(tabsMap)
    const activeTab = tabsArray.find(tab => tab.id === context.tabId && tab.windowId === context.windowId)

    // list all tab on window

    // find all tabs with same domain
    if (!activeTab) {
      return { tabs: [] }
    }

    const tabsFilterByHost = tabsArray
      .filter(tab => tab._ex.host === activeTab._ex.host)
      .map(o => ({ ...o, active: o.id === activeTab.id, nextTabId: -1 }))
    const tabsGroupByWindow = _.groupBy(tabsFilterByHost, o => o.windowId)

    const windows = Object.keys(tabsGroupByWindow).map(id => {
      return {
        id,
        isThisWindow: context.windowId ? Number(id) === Number(context.windowId) : false,
        tabs: _.sortBy(tabsGroupByWindow[id], o => o.index * -1),
      }
    })

    windows.forEach(o => {
      if (o.tabs && o.tabs.length > 1) {
        o.tabs = o.tabs.map((t, index) => {
          return { ...t, nextTabId: index === o.tabs.length - 1 ? o.tabs[0].id : o.tabs[index + 1].id }
        })
        o.tabs = _.sortBy(o.tabs, o => o.discarded)
      }
    })

    return {
      tabs: tabsFilterByHost,
    }
  },
)

export const selectActiveWebisteContainer = createSelector(
  [selectSpaces, selectContext, selectTabsMap],
  (spaces, context, tabsMap) => {
    return []
  },
)
