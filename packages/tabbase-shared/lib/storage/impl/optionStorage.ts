import { createStorage, StorageEnum } from '../base/index.js'

type OptionInterface = {
  activeSpaceId: string | null
}

const storage = createStorage<OptionInterface>(
  'options',
  {
    activeSpaceId: null,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: false,
  },
)

export const optionStorage = {
  ...storage,
  updateActiveSpaceId: async (activeSpaceId: string) => {
    await storage.set(payload => {
      return { ...payload, activeSpaceId }
    })
  },
}
