import { readdirSync, existsSync } from 'fs'
import { merge, isEmpty } from 'lodash'
import { IResolvers } from 'graphql-tools'

class SchemaGenerator {
  path: string
  indexFile: string

  constructor(path: string, indexFile: string = 'index.js') {
    this.path = path
    this.indexFile = indexFile
  }

  createTypes() {
    let RootQuery = `
      # the schema allows the following queries:
      type RootQuery {
    `

    let typeDefs = ''
    let query = ''
    let subscription = ''

    let Mutations = `
      type Mutations {
    `

    let Subscriptions = `
      type Subscriptions {
    `

    let mutation = ''
    readdirSync(this.path).forEach((dir) => {
      const dirIndexPath = `${this.path}/${dir}/${this.indexFile}`
      if (existsSync(dirIndexPath)) {
        const { type, typeQuery, typeMutation, typeSubscription } = require(dirIndexPath)
        typeDefs += type
        query += typeQuery || ''
        mutation += typeMutation || ''
        subscription += typeSubscription || ''
      }
    })

    RootQuery += `${query}\n  }\n`
    Mutations += `${mutation}\n  }\n`
    Subscriptions += `${subscription}\n } \n`

    typeDefs += query.length !== 0 ? RootQuery : ''
    typeDefs += mutation.length !== 0 ? Mutations : ''
    typeDefs += subscription.length !== 0 ? Subscriptions : ''

    const SchemaDefinition = `
schema {
  ${query.length !== 0 ? 'query: RootQuery\n' : ''}
  ${mutation.length !== 0 ? 'mutation: Mutations\n' : ''}
  ${subscription.length !== 0 ? 'subscription: Subscriptions\n' : ''}
}
  `
    typeDefs += SchemaDefinition

    return typeDefs
  }

  createResolvers() {
    let mergedResolvers = {}
    let rootQuery = {}
    let rootMutations = {}
    let rootSubscriptions = {}
    readdirSync(this.path).forEach((dir) => {
      const dirIndexPath = `${this.path}/${dir}/${this.indexFile}`
      if (existsSync(dirIndexPath)) {
        const { resolvers, queries, mutations, subscriptions } = require(dirIndexPath)
        mergedResolvers = merge(mergedResolvers, resolvers)
        rootQuery = merge(rootQuery, queries)
        rootMutations = merge(rootMutations, mutations)
        rootSubscriptions = merge(rootSubscriptions, subscriptions)
      }
    })

    const objToReturn = <IResolvers>{
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

  makeSchema() {
    return {
      typeDefs: this.createTypes(),
      resolvers: this.createResolvers(),
    }
  }
}

export default SchemaGenerator
