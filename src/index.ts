import { readdirSync, existsSync } from 'fs'
import { merge, isEmpty } from 'lodash'

interface Resolvers {
  RootQuery?: Object
  Mutations?: Object
}

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

    let Mutations = `
      type Mutations {
    `

    let mutation = ''
    readdirSync(this.path).forEach((dir) => {
      const dirIndexPath = `${this.path}/${dir}/${this.indexFile}`
      if (existsSync(dirIndexPath)) {
        const { type, typeQuery, typeMutation } = require(dirIndexPath)
        typeDefs += type
        query += typeQuery || ''
        mutation += typeMutation || ''
      }
    })

    RootQuery += `${query}\n  }\n`
    Mutations += `${mutation}\n  }\n`
    typeDefs += query.length !== 0 ? RootQuery : ''
    typeDefs += mutation.length !== 0 ? Mutations : ''
    const SchemaDefinition = `
    schema {
    ${query.length !== 0 ? 'query: RootQuery\n' : ''}
    ${mutation.length !== 0 ? 'mutation: Mutations\n' : ''}
  }
  `
    typeDefs += SchemaDefinition

    return typeDefs
  }

  createResolvers() {
    let mergedResolvers = {}
    let rootQuery = {}
    let rootMutations = {}
    readdirSync(this.path).forEach((dir) => {
      const dirIndexPath = `${this.path}/${dir}/${this.indexFile}`
      if (existsSync(dirIndexPath)) {
        const { resolvers, queries, mutations } = require(dirIndexPath)
        mergedResolvers = merge(mergedResolvers, resolvers)
        rootQuery = merge(rootQuery, queries)
        rootMutations = merge(rootMutations, mutations)
      }
    })

    const objToReturn = <Resolvers>{
      ...mergedResolvers,
    }

    if (!isEmpty(rootQuery)) {
      objToReturn.RootQuery = rootQuery
    }

    if (!isEmpty(rootMutations)) {
      objToReturn.Mutations = rootMutations
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
