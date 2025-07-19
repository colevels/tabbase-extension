import _ from 'lodash'

import { pinTabsStorage, optionStorage } from '../../../storage/index.js'
import { formatTabs } from '../../../utils/index.js'
import { createAppSlice } from '../../createAppSlice.js'
import api from '../../../api/index.js'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { Space, TabMap } from './types.js'
import type { TabExtend } from '../../../utils/index.js'
import type { RootState } from '../../store.js'

// --> to storage --> to service

interface tabSliceState {
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

  activeSpaceId: string
  spaces: Record<string, Space>

  profile?: {
    id: string
    name: string
    premium: boolean
  }

  _spaces: any[]
  _activeSpaceId?: string | null
}

const initialState: tabSliceState = {
  value: 0,
  status: 'idle',

  tabs: [],
  tabGroups: [],
  tabIds: [],
  windows: [],
  context: {
    windowId: -99,
    tabId: -99,
  },

  activeSpaceId: 'tabs',

  profile: undefined,
  _spaces: [],
  _activeSpaceId: undefined,

  tabsMap: {},

  spaces: {
    base: {
      id: 'base',
      name: 'BASE',
      tabMaps: {},
      containers: {
        // tabs: [], // auto generated
        // pinTabs: [],
      },
    },
    tabs: {
      id: 'tabs',
      name: 'tabs',
      tabMaps: {},
      containers: {
        // tabs: [], // auto generated
        // pinTabs: createRange(1, index => `P${index + 1}`),
      },
    },
  },
}

export const tabSlice = createAppSlice({
  name: 'tab',
  initialState,
  reducers: create => ({
    onActGetExample: create.asyncThunk(
      async () => {
        const response = await fetch('https://tabbase.com/api/dev/spaces', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const result = await response.json()
        console.log('result', result)

        const snapshot = pinTabsStorage.getSnapshot()
        console.log('snapshot', snapshot)

        const get = await pinTabsStorage.get()
        console.log('snapshot get', get)

        return result
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          state.value += action.payload.data
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActUpdateSpace: create.asyncThunk(
      async (spaceId: string, data: any) => {
        await api.updateSpace(spaceId, data)
        return data
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          state.value += action.payload.data
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActGetOptions: create.asyncThunk(
      async () => {
        const options = await optionStorage.get()
        console.log('options', options)
        return options
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          console.log('fulfilled', action.payload)
          state._activeSpaceId = action.payload.activeSpaceId || null
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActGetProfile: create.asyncThunk(
      async () => {
        return {
          id: '123',
          name: 'John Doe',
          premium: true,
        }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          // state.value += action.payload.data
          state.profile = action.payload
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActGetSpaces: create.asyncThunk(
      async () => {
        return [
          {
            id: 'space1',
            name: 'Space One',
            description: 'This is the first space.',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-02T00:00:00Z',
          },
          {
            id: 'space2',
            name: 'Space Two',
            description: 'This is the second space.',
            createdAt: '2023-01-03T00:00:00Z',
            updatedAt: '2023-01-04T00:00:00Z',
          },
        ]
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          state._spaces = action.payload
          // state.value += action.payload.data
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActGetActiveSpace: create.asyncThunk(
      async (id: string) => {
        // Simulate fetching active space by ID
        return {
          id,
          name: `Active Space ${id}`,
          description: `This is the active space with ID ${id}.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          // state.value += action.payload.data
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

    onActUpdateActiveSpace: create.asyncThunk(
      async (id: string) => {
        // Simulate updating active space by ID
        return {
          id,
          name: `Updated Active Space ${id}`,
          description: `This is the updated active space with ID ${id}.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          // state.value += action.payload.data
        },
        rejected: state => {
          state.status = 'failed'
        },
      },
    ),

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

          // state.spaces = {
          //   ...state.spaces,
          //   [state.activeSpaceId]: {
          //     ...state.spaces[state.activeSpaceId],
          //     containers: {
          //       ...state.spaces[state.activeSpaceId].containers,
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

    onActActiveContainerSpace: create.reducer((state, action: PayloadAction<{ activeSpaceId: string }>) => {
      state.activeSpaceId = action.payload.activeSpaceId
    }),

    // TODO
    updateItems: create.reducer((state, action: PayloadAction<{ id: string; items: string[] }>) => {
      console.log('update items', action.payload)

      if (action.payload.id === 'tabs') {
        return
      }

      console.log('new state', {
        ...state.spaces[state.activeSpaceId].containers,
        [action.payload.id]: action.payload.items,
      })

      // make tabs map
      // const tapMaps =

      // -- what happens if tab id not exists on other spaces
      //

      state.spaces = {
        ...state.spaces,
        [state.activeSpaceId]: {
          ...state.spaces[state.activeSpaceId],
          containers: {
            ...state.spaces[state.activeSpaceId].containers,
            [action.payload.id]: action.payload.items,
          },
        },
      }
    }),

    // TODO
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

    onActChangeActiveSpace: create.asyncThunk(
      async (args: { activeSpaceId: string }, thunkApi) => {
        await optionStorage.updateActiveSpaceId(args.activeSpaceId)
        return { activeSpaceId: args.activeSpaceId }
      },
      {
        pending: state => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state._activeSpaceId = action.payload.activeSpaceId
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
  onActGetExample,
  onActGetProfile,
  onActGetSpaces,
  onActGetActiveSpace,
  onActUpdateActiveSpace,
  onActGetOptions,
} = tabSlice.actions

export const { selectCount, selectStatus } = tabSlice.selectors
