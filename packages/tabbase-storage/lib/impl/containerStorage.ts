import { createStorage, StorageEnum } from '../base/index.js'

type PinTabs = {
  [id: string]: {
    id: string
    name: string
    pinTabs: string[]
  }
}

const containerBaseStorage = createStorage<PinTabs>(
  'container-storage-key',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: false,
  },
)

export const containerStorage = {
  ...containerBaseStorage,
  setContainer: async (id: string, name: string, pinTabs: string[]) => {
    await containerBaseStorage.set(current => {
      return {
        ...current,
        [id]: {
          id,
          name,
          pinTabs,
        },
      }
    })
  },
}
