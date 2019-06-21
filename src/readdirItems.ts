import { readdirSync, existsSync } from 'fs'

import { DirExports } from './types'

const EXTENSIONS = ['.js', '.ts']

const loadFileItems = (path: string): DirExports => {
  const {
    resolvers,
    queries,
    mutations,
    subscriptions,

    type,
    typeQuery,
    typeMutation,
    typeSubscription,
    ...otherProps
  } = require(path)

  const otherPropKeys = Object.keys(otherProps)
  if (otherPropKeys.length > 0) {
    console.warn(
      `Unexpected properties exported from ${path}: ${otherPropKeys.join(
        ', ',
      )}`,
    )
  }

  return {
    resolvers,
    queries,
    mutations,
    subscriptions,

    type: type != null ? type.trim() : undefined,
    typeQuery: typeQuery != null ? typeQuery.trim() : undefined,
    typeMutation: typeMutation != null ? typeMutation.trim() : undefined,
    typeSubscription:
      typeSubscription != null ? typeSubscription.trim() : undefined,
  }
}

const readdirItems = (path: string): DirExports[] => {
  const items: DirExports[] = []

  readdirSync(path).forEach((dir) => {
    for (const extension of EXTENSIONS) {
      const dirIndexPath = `${path}/${dir}/index${extension}`
      if (existsSync(dirIndexPath)) {
        items.push(loadFileItems(dirIndexPath))
        break
      }
    }
  })

  return items
}

export default readdirItems
