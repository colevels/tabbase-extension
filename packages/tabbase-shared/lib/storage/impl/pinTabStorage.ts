import { createStorage, StorageEnum } from '../base/index.js'

type PinTabs = {
  [id: string]: {
    id: string
    title: string
    url: string
    spaceId: string
  }
}

const storagePinTabs = createStorage<PinTabs>(
  'pin-tabs-v2-storage-key',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: false,
  },
)

export const pinTabsStorage = {
  ...storagePinTabs,
  setTab: async (id: string, title: string, url: string, spaceId: string) => {
    await storagePinTabs.set(currentTabs => {
      return {
        ...currentTabs,
        [id]: {
          id,
          title,
          url,
          spaceId,
        },
      }
    })
  },
}
