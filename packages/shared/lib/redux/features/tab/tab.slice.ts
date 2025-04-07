import type { PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'

import { examplePinTabsStorage } from '@extension/storage'

import { formatTabs } from '../../../utils/index.js'
import { createRange } from './utils.js'

import { createAppSlice } from '../../createAppSlice.js'

import type { TabExtend } from '../../../utils/index.js'
import type { RootState } from '../../store.js'

type UniqueIdentifier = string | number

type Space = {
  id: number
  name: string
  type: string
  description: string
  url: string
  domain: string
}

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>

export interface tabSliceState {
  value: number
  status: 'idle' | 'loading' | 'failed'
  tabGroups: chrome.tabGroups.TabGroup[]
  tabs: TabExtend[]
  tabsMap: { [key: number]: TabExtend }
  tabIds: number[]
  windows: chrome.windows.Window[]
  events: string[]
  context: {
    windowId: number | null
    tabId: number | null
  }
  spaces: Space[]
  spacesMap: {
    [key: number]: Space
  }
  containers: Items
  containersIds: string[]
}

const initialState: tabSliceState = {
  value: 0,
  status: 'idle',

  tabGroups: [],

  tabs: [],
  tabsMap: {},
  tabIds: [],

  windows: [],
  events: [],

  spaces: [],
  spacesMap: {},

  context: {
    windowId: -99,
    tabId: -99,
  },
  containers: {
    A: createRange(10, index => `A${index + 1}`),
    B: createRange(10, index => `B${index + 1}`),
    C: createRange(10, index => `C${index + 1}`),
    D: createRange(10, index => `D${index + 1}`),
    tabs: [],
    pinTabs: createRange(4, index => `P${index + 1}`),
  },
  containersIds: ['A', 'B', 'C', 'D', 'tabs', 'pinTabs'],
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

          state.containers = {
            ...state.containers,
            tabs: action.payload.tabIds,
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

    onActCreateSpace: create.asyncThunk(
      async (args, thunkApi) => {
        // console.log('space', space)
        const state = thunkApi.getState() as RootState
        const currentTab = state.tab.context.tabId

        if (currentTab) {
          const tab = state.tab.tabsMap[currentTab]

          if (tab) {
            const { url, title } = tab
            const space: Space = {
              id: 1,
              name: title || 'untitled',
              type: 'domain',
              description: 'description',
              url: url || '',
              domain: tab._ex?.host || '',
            }

            return space
          }
        }

        return null
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          if (action.payload) {
            state.spaces.push(action.payload)
          }
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActPinTab: create.asyncThunk(
      async () => {
        // console.log('space', space)
        examplePinTabsStorage.setTab('A1', {})
        return null
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
      // setItems(items => ({
      //   ...items,
      //   [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
      // }))

      state.containers[action.payload.id] = action.payload.items
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
  onActCreateSpace,
  onActPinTab,
  updateItems,
} = tabSlice.actions

export const { selectCount, selectStatus } = tabSlice.selectors
