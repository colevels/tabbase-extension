// export type TabExtend = chrome.tabs.Tab & { _info: { host: string | null } }
type ExtensionInfo = {
  host: string | null
  deleted?: boolean
}

export interface TabExtend extends chrome.tabs.Tab {
  id: number
  key?: number
  _ex: ExtensionInfo
}

export type ValueOf<T> = T[keyof T]
