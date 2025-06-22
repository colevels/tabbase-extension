// features/cart/cartSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import _ from 'lodash'
import type { Containers } from './types.js'
import type { RootState } from '../../store.js'

// Input selector: Access the `items` from the cart slice
const selectTabs = (state: RootState) => state.tab.tabs
const selectTabGroups = (state: RootState) => state.tab.tabGroups
const selectTabsMap = (state: RootState) => state.tab.tabsMap
const selectTabIds = (state: RootState) => state.tab.tabIds
const selectContext = (state: RootState) => state.tab.context
// const selectContainers = (state: RootState) => state.tab.containers
const selectSpaces = (state: RootState) => state.tab.spaces
const selectActiveSpaceId = (state: RootState) => state.tab.activeSpaceId

// Memoized selector: Calculate the total price of items in the cart
export const selectTabsList = createSelector(
  [selectTabs, selectTabGroups, selectTabsMap, selectContext], // Input selectors
  (items, tabGroups, tabsMap, context) => {
    const tabs = Object.values(tabsMap).map(tab => ({
      ...tab,
      active: tab.id === context.tabId,
    }))

    return { tabs: _.sortBy(tabs, 'index') }
  }, // Result function
)

export const selectTabContainers = createSelector([selectTabsMap], tabsMap => ({
  containers: [],
  tabsMap,
}))

export const selectSpace = createSelector(
  [selectSpaces, selectActiveSpaceId, selectTabsMap, selectTabIds],
  (spaces, activeSpaceId, tabsMap, tabIds) => {
    let containers: Containers = {}

    console.log('spaces', spaces)
    console.log('activeSpaceId', activeSpaceId)

    Object.values(spaces).map(o => {
      if (o.id === activeSpaceId) {
        containers = { ...o.containers }
      }
    })

    if (!containers.pinTabs) {
      containers = { ...containers, pinTabs: [] }
    }

    console.log('test')

    if (!_.has(containers, 'tabs')) {
      const pinTabs = containers.pinTabs.map(o => o.toString())
      const tabIdsNotInPinTabs = _.difference(
        tabIds.map(o => o.toString()),
        pinTabs,
      )
      containers = { ...containers, tabs: tabIdsNotInPinTabs.map(o => o.toString()) }
      console.log('containers', containers)
    }

    return { tabsMap, containers }
  },
)
