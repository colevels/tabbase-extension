export type UniqueIdentifier = string | number

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>

export type ContainerSpace = {
  id: string
  name: string
  pinTabs: string[] | number[]
  containers: Items
}
