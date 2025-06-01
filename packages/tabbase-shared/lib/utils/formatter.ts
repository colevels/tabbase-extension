import _ from 'lodash'
import type { TabExtend } from './shared-types.js'

const getFullUrl = <T extends { url?: string | undefined }>(tab: T): URL | null => {
  if (_.isNil(tab.url)) {
    return null
  }

  try {
    const url = new URL(tab.url)
    return url
  } catch {
    return null
  }
}

export const formatTabs = (tabs: chrome.tabs.Tab[]) => {
  const result: TabExtend[] = []

  tabs.forEach(o => {
    if (o.id !== undefined && o.url !== undefined) {
      const hostInfo = getFullUrl(o)
      result.push({
        ...o,
        id: o.id,
        _ex: {
          host: hostInfo ? hostInfo.host : null,
        },
      })
    }
  })

  return result
}
