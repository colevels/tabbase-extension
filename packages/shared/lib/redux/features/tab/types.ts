import { TabExtend } from '../../../utils/index.js'

export type Containers = Record<string, string[]>

export type ContainerSpace = {
  id: string
  name: string
  containers: Containers
}

export type TabMap = Record<string, TabExtend>
