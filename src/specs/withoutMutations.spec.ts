import anyTest, { TestInterface } from 'ava'
import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql'

import Saturn from '../index'

const test = anyTest as TestInterface<{
  types: any,
  resolvers: any,
  schema: any,
}>

test.beforeEach((t) => {
  const saturn = new Saturn(`${__dirname}/withoutMutations`)
  const types = saturn.createTypes()
  const resolvers = saturn.createResolvers()
  const schema = makeExecutableSchema(saturn.makeSchema())

  t.context = {
    types,
    resolvers,
    schema,
  }
})

test('should return a string', (t) => {
  const { types } = t.context
  t.is(typeof types, 'string')
})

test('should return an object', (t) => {
  const { resolvers } = t.context
  t.is(typeof resolvers, 'object')
})

test('should return an RootQuery key', (t) => {
  const { resolvers } = t.context
  t.truthy(resolvers.RootQuery)
})

test('RootQuery should have posts and author keys and they should both be functions', (t) => {
  const { resolvers } = t.context
  t.truthy(resolvers.RootQuery.posts)
  t.truthy(resolvers.RootQuery.author)
  t.is(typeof resolvers.RootQuery.posts, 'function')
  t.is(typeof resolvers.RootQuery.author, 'function')
})

test('should return an Mutations key', (t) => {
  const { resolvers } = t.context
  t.falsy(resolvers.Mutations)
})

test('should return an Author key', (t) => {
  const { resolvers } = t.context
  t.truthy(resolvers.Author)
})

test('Author should have posts key and should be a function', (t) => {
  const { resolvers } = t.context
  t.truthy(resolvers.Author.posts)
  t.is(typeof resolvers.Author.posts, 'function')
})

test('should return an Post key', (t) => {
  const { resolvers } = t.context
  t.truthy(resolvers.Author)
})

test('Post should have author key and should be a function', (t) => {
  const { resolvers } = t.context
  t.truthy(resolvers.Post.author)
  t.is(typeof resolvers.Post.author, 'function')
})

test('should return a graphql schema', (t) => {
  const { schema } = t.context
  t.truthy(schema)
})

test('schema should return a posts root query type', (t) => {
  const { schema } = t.context
  const query = schema.getTypeMap().RootQuery.getFields().posts
  t.truthy(query)
  const post = schema.getTypeMap().Post
  t.deepEqual(query.type, new GraphQLList(post))
})

test('schema should return a author root query type', (t) => {
  const { schema } = t.context
  const query = schema.getTypeMap().RootQuery.getFields().author
  t.truthy(query)
  const author = schema.getTypeMap().Author
  t.is(query.type, author)
  t.is(query.args[0].name, 'id')
  t.deepEqual(query.args[0].type, new GraphQLNonNull(GraphQLInt))
})

test('schema should NOT return a upvotePost mutation type', (t) => {
  const { schema } = t.context
  const query = schema.getTypeMap().Mutations
  t.falsy(query)
})

test('should have a Author type', (t) => {
  const { schema } = t.context

  const type = schema.getTypeMap().Author
  t.truthy(type)

  const fields = type.getFields()
  t.truthy(fields.id)
  t.truthy(fields.firstName)
  t.truthy(fields.lastName)
  t.truthy(fields.posts)

  t.deepEqual(fields.id.type, new GraphQLNonNull(GraphQLInt))
  t.is(fields.firstName.type, GraphQLString)
  t.is(fields.lastName.type, GraphQLString)

  const post = schema.getTypeMap().Post
  t.deepEqual(fields.posts.type, new GraphQLList(post))
})

test('should have a Post type', (t) => {
  const { schema } = t.context

  const type = schema.getTypeMap().Post
  t.truthy(type)

  const fields = type.getFields()
  t.truthy(fields.id)
  t.truthy(fields.title)
  t.truthy(fields.author)
  t.truthy(fields.votes)

  t.deepEqual(fields.id.type, new GraphQLNonNull(GraphQLInt))
  t.is(fields.title.type, GraphQLString)

  const author = schema.getTypeMap().Author
  t.is(fields.author.type, author)
  t.is(fields.votes.type, GraphQLInt)
})
