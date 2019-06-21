import { merge, isEmpty } from 'lodash'
import { IResolvers } from 'graphql-tools'

import readdirItems from './readdirItems'

import { DirExports } from './types'

class SchemaGenerator {
  private path: string
  private items: DirExports[]

  public constructor (path: string) {
    this.path = path
    this.items = readdirItems(this.path)
  }

  public createTypes () {
    const typeDefs = []
    const queryDefs = []
    const mutationDefs = []
    const subscriptionDefs = []
    const schemaDefs = []

    for (const item of this.items) {
      if (item.type != null) {
        typeDefs.push(item.type)
      }
      if (item.typeQuery != null) {
        queryDefs.push(item.typeQuery)
      }
      if (item.typeMutation != null) {
        mutationDefs.push(item.typeMutation)
      }
      if (item.typeSubscription != null) {
        subscriptionDefs.push(item.typeSubscription)
      }
    }

    if (queryDefs.length > 0) {
      typeDefs.push(`# the schema allows the following queries:
type RootQuery {
  ${queryDefs.join('\n  ')}
}`)
      schemaDefs.push('query: RootQuery')
    }
    if (mutationDefs.length > 0) {
      typeDefs.push(`# the schema allows the following mutations:
type Mutations {
  ${mutationDefs.join('\n  ')}
}`)
      schemaDefs.push('mutation: Mutations')
    }
    if (subscriptionDefs.length > 0) {
      typeDefs.push(`# the schema allows the following subscriptions:
type Subscriptions {
  ${subscriptionDefs.join('\n  ')}
}`)
      schemaDefs.push('subscriptions: Subscriptions')
    }

    typeDefs.push(`schema {
  ${schemaDefs.join('\n  ')}
}`)

    return typeDefs.join('\n')
  }

  public createResolvers () {
    const mergedResolvers = {}
    const rootQuery = {}
    const rootMutations = {}
    const rootSubscriptions = {}

    for (const item of this.items) {
      const { resolvers, queries, mutations, subscriptions } = item
      merge(mergedResolvers, resolvers)
      merge(rootQuery, queries)
      merge(rootMutations, mutations)
      merge(rootSubscriptions, subscriptions)
    }

    const objToReturn: IResolvers = {
      ...mergedResolvers,
    }

    if (!isEmpty(rootQuery)) {
      objToReturn.RootQuery = rootQuery
    }

    if (!isEmpty(rootMutations)) {
      objToReturn.Mutations = rootMutations
    }

    if (!isEmpty(rootSubscriptions)) {
      objToReturn.Subscriptions = rootSubscriptions
    }

    return objToReturn
  }

  public makeSchema () {
    return {
      typeDefs: this.createTypes(),
      resolvers: this.createResolvers(),
    }
  }
}

export default SchemaGenerator
