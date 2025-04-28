import { TabExtend } from '../../../utils/index.js'

export type Items = Record<string, string[]>

export type ContainerSpace = {
  id: string
  name: string
  containers: Items
}

export type TabMap = Record<string, TabExtend>
