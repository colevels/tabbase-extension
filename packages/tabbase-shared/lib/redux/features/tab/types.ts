import type { TabExtend } from '../../../utils/index.js'

export type Containers = Record<string, string[]>

export type Space = {
  id: string
  name: string
  containers: Containers
  tabMaps: TabMap
}

export type TabMap = Record<string, TabExtend>
