// features/cart/cartSelectors.ts
import _ from 'lodash'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store.js'
import type { Containers } from './types.js'

// Input selector: Access the `items` from the cart slice
const selectTabs = (state: RootState) => state.tab.tabs
const selectTabGroups = (state: RootState) => state.tab.tabGroups
const selectTabsMap = (state: RootState) => state.tab.tabsMap
const selectTabIds = (state: RootState) => state.tab.tabIds
const selectContext = (state: RootState) => state.tab.context
// const selectContainers = (state: RootState) => state.tab.containers
const selectContainersSpaces = (state: RootState) => state.tab.containersSpaces
const seelctActiveContainerSpace = (state: RootState) => state.tab.activeContainerSpace

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

export const selectTabContainers = createSelector([selectTabsMap], tabsMap => {
  return {
    containers: [],
    tabsMap,
  }
})

export const selectContainersSpacesDisplay = createSelector(
  [selectContainersSpaces, seelctActiveContainerSpace, selectTabsMap, selectTabIds],
  (containersSpaces, activeContainerSpace, tabsMap, tabIds) => {
    let containers: Containers = {}
    console.log('containersSpaces', containersSpaces)
    console.log('activeContainerSpace', activeContainerSpace)

    const spaces = Object.values(containersSpaces).map(o => {
      if (o.id === activeContainerSpace) {
        containers = { ...o.containers }
      }

      return {
        ...o,
        active: o.id === activeContainerSpace,
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

    return {
      spaces,
      tabsMap,
      containersSpaces,
      containers,
    }
  },
)
