import _ from 'lodash'

import { pinTabsStorage } from '@extension/storage'

import { createRange } from './utils.js'
import { formatTabs } from '../../../utils/index.js'

import { createAppSlice } from '../../createAppSlice.js'

import type { TabExtend } from '../../../utils/index.js'
import type { RootState } from '../../store.js'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UniqueIdentifier, Items, ContainerSpace } from './types.js'

export interface tabSliceState {
  value: number
  status: 'idle' | 'loading' | 'failed'

  tabs: TabExtend[]
  tabGroups: chrome.tabGroups.TabGroup[]
  windows: chrome.windows.Window[]

  tabsMap: Record<string, TabExtend>
  tabIds: number[]

  context: {
    windowId: number | null
    tabId: number | null
  }

  // containers: Items
  // containersIds: string[]

  activeContainerSpace: string
  containersSpaces: Record<UniqueIdentifier, ContainerSpace>
}

const initialState: tabSliceState = {
  activeContainerSpace: 'tabs',

  containersSpaces: {
    tabs: {
      id: 'tabs',
      name: 'tabs',
      pinTabs: [],
      containers: {
        tabs: [],
        pinTabs: createRange(1, index => `P${index + 1}`),
      },
    },
    base: {
      id: 'base',
      name: 'BASE',
      pinTabs: ['A1', 'A2', 'A3', 'A4', 'A5'],
      containers: {},
    },
    work: {
      id: 'work',
      name: 'WORK',
      pinTabs: ['B1', 'B2', 'B3', 'B4', 'B5'],
      containers: {},
    },
    youtube: {
      id: 'youtube',
      name: 'YOUTUBE',
      pinTabs: ['C1', 'C2', 'C3', 'C4', 'C5'],
      containers: {},
    },
    personal: {
      id: 'personal',
      name: 'PERSONAL',
      pinTabs: ['D1', 'D2', 'D3', 'D4', 'D5'],
      containers: {},
    },
    content: {
      id: 'content',
      name: 'CONTENT',
      pinTabs: ['P1', 'P2', 'P3', 'P4', 'P5'],
      containers: {},
    },
  },

  value: 0,
  status: 'idle',

  tabGroups: [],

  tabs: [],
  tabsMap: {},
  tabIds: [],

  windows: [],

  context: {
    windowId: -99,
    tabId: -99,
  },

  // containers: {
  //   A: createRange(10, index => `A${index + 1}`),
  //   B: createRange(10, index => `B${index + 1}`),
  //   C: createRange(10, index => `C${index + 1}`),
  //   D: createRange(10, index => `D${index + 1}`),
  //   tabs: [],
  //   pinTabs: createRange(1, index => `P${index + 1}`),
  // },

  // containersIds: ['A', 'B', 'C', 'D', 'tabs', 'pinTabs'],
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
        return { tabs, tabIds }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          const tabsMap: { [key: number]: TabExtend } = action.payload.tabs.reduce(
            (acc: { [key: number]: TabExtend }, tab: TabExtend) => {
              if (tab.id) {
                acc[tab.id] = tab
              }
              return acc
            },
            {},
          )

          state.status = 'idle'

          state.tabs = action.payload.tabs
          state.tabsMap = tabsMap
          state.tabIds = action.payload.tabIds

          // state.containers = {
          //   ...state.containers,
          //   tabs: action.payload.tabIds,
          // }

          state.containersSpaces = {
            ...state.containersSpaces,
            [state.activeContainerSpace]: {
              ...state.containersSpaces[state.activeContainerSpace],
              containers: {
                ...state.containersSpaces[state.activeContainerSpace].containers,
                tabs: action.payload.tabIds,
              },
            },
          }
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
        // state.containers = {
        //   ...state.containers,
        //   tabs: [...state.containers.tabs, action.payload.tab.id],
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
        // state.containers = {
        //   ...state.containers,
        //   tabs: state.containers.tabs.filter(o => o !== tabId),
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

    updateItems: create.reducer((state, action: PayloadAction<{ id: UniqueIdentifier; items: UniqueIdentifier[] }>) => {
      // state.containers[action.payload.id] = action.payload.items

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

      // const name = state.containers[action.payload.id]
      // containerStorage.setContainer(action.payload.id, )
    }),

    onActActiveContainerSpace: create.reducer((state, action: PayloadAction<{ activeContainerSpace: string }>) => {
      state.activeContainerSpace = action.payload.activeContainerSpace
    }),
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
