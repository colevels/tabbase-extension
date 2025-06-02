import _ from 'lodash'

import { pinTabsStorage } from '@extension/storage'

import { createRange } from './utils.js'
import { formatTabs } from '../../../utils/index.js'

import { createAppSlice } from '../../createAppSlice.js'

import type { PayloadAction } from '@reduxjs/toolkit'

import type { TabExtend } from '../../../utils/index.js'
import type { RootState } from '../../store.js'
import type { ContainerSpace, TabMap } from './types.js'

export interface tabSliceState {
  value: number
  status: 'idle' | 'loading' | 'failed'

  tabs: TabExtend[]
  tabGroups: chrome.tabGroups.TabGroup[]
  windows: chrome.windows.Window[]

  tabsMap: TabMap
  tabIds: number[]

  context: {
    windowId: number | null
    tabId: number | null
  }

  activeContainerSpace: string
  containersSpaces: Record<string, ContainerSpace>
}

const initialState: tabSliceState = {
  value: 0,
  status: 'idle',

  tabs: [],
  tabGroups: [],
  tabsMap: {},
  tabIds: [],
  windows: [],
  context: {
    windowId: -99,
    tabId: -99,
  },

  activeContainerSpace: 'tabs',

  containersSpaces: {
    base: {
      id: 'base',
      name: 'BASE',
      containers: {
        // tabs: [],
        // pinTabs: [],
      },
    },
    tabs: {
      id: 'tabs',
      name: 'tabs',

      containers: {
        // tabs: [],
        // pinTabs: createRange(1, index => `P${index + 1}`),
      },
    },
  },
}

export const tabSlice = createAppSlice({
  name: 'tab',
  initialState,
  reducers: create => ({
    onActGetTabs: create.asyncThunk(
      async () => {
        const response = await chrome.tabs.query({})
        const tabs = formatTabs(response)

        const tabIds = tabs.map(o => o.id)
        const tabsMap = tabs.reduce((acc: TabMap, tab: TabExtend) => {
          acc[`${tab.id}`] = tab
          return acc
        }, {})

        return { tabs, tabIds, tabsMap }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'

          state.tabs = action.payload.tabs
          state.tabIds = action.payload.tabIds
          state.tabsMap = action.payload.tabsMap

          // state.containersSpaces = {
          //   ...state.containersSpaces,
          //   [state.activeContainerSpace]: {
          //     ...state.containersSpaces[state.activeContainerSpace],
          //     containers: {
          //       ...state.containersSpaces[state.activeContainerSpace].containers,
          //       // tabs: action.payload.tabIds.map(o => o.toString()),
          //     },
          //   },
          // }
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),
    onActTabCreated: create.reducer((state, action: PayloadAction<{ tab: chrome.tabs.Tab }>) => {
      if (Number.isFinite(action.payload.tab.id) && action.payload.tab.id) {
        // TODO:
        const tab = formatTabs([action.payload.tab])[0]
        state.tabsMap[action.payload.tab.id] = tab
        state.tabs.push(tab)
        state.tabIds.push(action.payload.tab.id)

        // state.containersSpaces = {
        //   ...state.containersSpaces,
        //   [state.activeContainerSpace]: {
        //     ...state.containersSpaces[state.activeContainerSpace],
        //     containers: {
        //       ...state.containersSpaces[state.activeContainerSpace].containers,
        //       tabs: [
        //         ...state.containersSpaces[state.activeContainerSpace].containers.tabs,
        //         action.payload.tab.id.toString(),
        //       ],
        //     },
        //   },
        // }
      }
    }),
    onActTabUpdated: create.reducer(
      (
        state,
        action: PayloadAction<{ tabId: number; changeInfo: chrome.tabs.TabChangeInfo; tab: chrome.tabs.Tab }>,
      ) => {
        const { tabId, changeInfo, tab } = action.payload

        if (!Number.isFinite(tabId) || !state.tabsMap[tabId]) {
          return
        }

        const isChangeComplete = _.get(changeInfo, 'status', false) === 'complete' || tab.status === 'complete'
        const fieldUpdated = [
          _.has(changeInfo, 'title'),
          _.has(changeInfo, 'url'),
          _.has(changeInfo, 'favIconUrl'),
          _.has(changeInfo, 'status'),
          _.has(changeInfo, 'discarded'),
        ]

        const isFieldUpdated = fieldUpdated.some(o => o)

        if (isFieldUpdated && isChangeComplete) {
          console.log('viva')

          // TODO: CAN BE IMPROVED CHECK HOST
          state.tabsMap[tabId] = formatTabs([action.payload.tab])[0]
          console.log('vol', state.tabsMap[tabId])
        }
      },
    ),
    onActTabRemoved: create.reducer((state, action: PayloadAction<{ tabId: number }>) => {
      const { tabId } = action.payload

      if (Number.isFinite(tabId) && state.tabsMap[tabId]) {
        delete state.tabsMap[tabId]

        // state.containersSpaces = {
        //   ...state.containersSpaces,
        //   [state.activeContainerSpace]: {
        //     ...state.containersSpaces[state.activeContainerSpace],
        //     containers: {
        //       ...state.containersSpaces[state.activeContainerSpace].containers,
        //       tabs: state.containersSpaces[state.activeContainerSpace].containers.tabs.filter(
        //         o => o != tabId.toString(),
        //       ),
        //     },
        //   },
        // }
      }
    }),

    onActTabActivated: create.reducer((state, action: PayloadAction<{ activeInfo: chrome.tabs.TabActiveInfo }>) => {
      console.log('activeInfo', action.payload.activeInfo)

      const { activeInfo } = action.payload

      if (state.context.windowId === null) return

      if (activeInfo.windowId === state.context.windowId) {
        state.context.tabId = activeInfo.tabId
      }
    }),
    onActTabMoved: create.reducer(
      (state, action: PayloadAction<{ tabId: number; moveInfo: chrome.tabs.TabMoveInfo }>) => {},
    ),

    onActGetTabGroups: create.asyncThunk(
      async () => {
        const response = await chrome.tabGroups.query({})
        return response
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          state.tabGroups = action.payload
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActTabGroupCreated: create.reducer((state, action: PayloadAction<{ tabGroup: chrome.tabGroups.TabGroup }>) => {}),
    onActTabGroupUpdated: create.reducer((state, action: PayloadAction<{ tabGroup: chrome.tabGroups.TabGroup }>) => {}),
    onActTabGroupDeleted: create.reducer((state, action: PayloadAction<{ tabGroup: chrome.tabGroups.TabGroup }>) => {}),

    onActGetWindows: create.asyncThunk(
      async () => {
        const response = await chrome.windows.getAll({})
        return response
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          state.windows = action.payload
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActSetContext: create.asyncThunk(
      async () => {
        const window = await chrome.windows.getCurrent()
        const tabs = await chrome.tabs.query({ active: true, windowId: window.id })
        return {
          tabId: tabs.length === 0 ? null : _.isUndefined(tabs[0].id) ? null : tabs[0].id,
          windowId: _.isUndefined(window.id) ? null : window.id,
        }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.context = {
            ...state.context,
            tabId: action.payload.tabId,
            windowId: action.payload.windowId,
          }
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActActiveTab: create.asyncThunk(
      async (id: number) => {
        console.log('id', id)
        const tab = await chrome.tabs.update(id, { active: true })
        return tab
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: state => {
          state.status = 'idle'
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActCloseTabs: create.asyncThunk<number[], { tabIds: number[]; activeNextTabId?: number }>(
      async (args, thunkApi) => {
        const tabIds = [...args.tabIds]
        const state = thunkApi.getState() as RootState
        const currentTab = state.tab.context.tabId

        // dont close current tab
        if (tabIds.length > 1 && currentTab && tabIds.indexOf(currentTab) !== -1) {
          tabIds.splice(tabIds.indexOf(currentTab), 1)
        }

        if (tabIds.length === 0) {
          return []
        }

        // if (args.activeNextTab) {
        //   // find next tab to active
        //   const tabs = await chrome.tabs.query({ currentWindow: true })
        //   const tabIds = tabs.map((o) => o.id)
        //   const index = tabIds.indexOf(args.tabIds[0])
        //   const nextTabId = tabIds[index + 1] || tabIds[index - 1]
        //   if (nextTabId && index > -1) {
        //     await chrome.tabs.update(nextTabId, { active: true })
        //   }
        // }

        // thunkApi.dispatch(onActionRemoveTabsByTabIds({ tabIds }))

        try {
          await chrome.tabs.remove(tabIds)
          return tabIds
        } catch (error) {
          console.error('error', error)
          return []
        }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActActiveContainerSpace: create.reducer((state, action: PayloadAction<{ activeContainerSpace: string }>) => {
      state.activeContainerSpace = action.payload.activeContainerSpace
    }),

    updateItems: create.reducer((state, action: PayloadAction<{ id: string; items: string[] }>) => {
      console.log('update items', action.payload)

      if (action.payload.id === 'tabs') {
        return
      }

      state.containersSpaces = {
        ...state.containersSpaces,
        [state.activeContainerSpace]: {
          ...state.containersSpaces[state.activeContainerSpace],
          containers: {
            ...state.containersSpaces[state.activeContainerSpace].containers,
            [action.payload.id]: action.payload.items,
          },
        },
      }
    }),

    onActPinTab: create.asyncThunk<boolean, { tabId: number | string }>(
      async (args, thunkApi) => {
        const tabs = thunkApi.getState() as RootState
        const tab = tabs.tab.tabsMap[args.tabId]
        // console.log('space', space)
        // examplePinTabsStorage.setTab('A1', {})
        // pinTabsStorage.setTab(args, tab.title, tab.url, 'A1')
        pinTabsStorage.setTab(tab.id.toString(), tab.title || '', tab.url || '', 'A1')
        return true
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),
  }),
  selectors: {
    selectCount: counter => counter.value,
    selectStatus: counter => counter.status,
  },
})

export const {
  onActGetTabs,
  onActTabCreated,
  onActTabUpdated,
  onActTabRemoved,
  onActTabActivated,
  onActGetTabGroups,
  onActTabGroupCreated,
  onActTabGroupDeleted,
  onActTabGroupUpdated,
  onActGetWindows,
  onActSetContext,
  onActActiveTab,
  onActCloseTabs,
  onActPinTab,
  updateItems,
  onActActiveContainerSpace,
} = tabSlice.actions

export const { selectCount, selectStatus } = tabSlice.selectors
