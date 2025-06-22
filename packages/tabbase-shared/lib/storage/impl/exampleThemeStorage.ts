import type { BaseStorage } from '../base/index.js'
import { createStorage, StorageEnum } from '../base/index.js'

type Theme = 'light' | 'dark'

type ThemeStorage = BaseStorage<Theme> & {
  toggle: () => Promise<void>
}

const storage = createStorage<Theme>('theme-storage-key', 'light', {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
})

// You can extend it with your own methods
export const exampleThemeStorage: ThemeStorage = {
  ...storage,
  toggle: async () => {
    await storage.set(currentTheme => {
      return currentTheme === 'light' ? 'dark' : 'light'
    })
  },
}

const storagePinTabs = createStorage<string>('pin-tabs-storage-key', '', {
  storageEnum: StorageEnum.Local,
  liveUpdate: false,
})

export const examplePinTabsStorage = {
  ...storagePinTabs,
  setTab: async (tabId: string, tab: any) => {
    await storagePinTabs.set(currentTabs => {
      return '' + tabId + '|' + JSON.stringify(tab) + '|' + currentTabs
    })
  },
}
