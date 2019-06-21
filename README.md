# DEPRECATION NOTICE

This project has been moved to
[`@mishguru/graphlqdir`](https://github.com/mishguruorg/graphqldir). Please
open issues and pulll requests over there.

# Saturn-GQL

## Install
```
npm i @stayradiated/saturn-gql
```

Has your GraphQL api code grown out of control? Does your GraphQL api sit in a
single file with thousands of lines of code? Unsure of the best way to
logically separate it all? Saturn-GQL is here to help!

Saturn-GQL takes care of packaging up your modularized
[graphql-tools](https://github.com/apollographql/graphql-tools) schema,
allowing you to separate your types, queries and mutations into logical
groupings.

To get started, you'll need to split your graphql api into a directory
structure similar to the diagram below. If you are already using
[graphql-tools](https://github.com/apollographql/graphql-tools) this should be
a fairly trivial step.

``` shell
graphql
  group1
    index.js
  group2
    index.js
  group3
    index.js
```

Each index file can export the following properties:

- `resolvers`
- `queries`
- `mutations`
- `subscriptions`
- `type`
- `typeQuery`
- `typeMutation`
- `typeSubscription`

## To Use

``` javascript
import { makeExecutableSchema } from 'apollo-tools'

import Saturn from '@stayradiated/saturn-gql';
const saturn = new Saturn(`${__dirname}/graphql`);

// Graphql Schema
const schema = makeExecutableSchema(saturn.makeSchema());

// just types
const types = saturn.createTypes();

// just resolvers
const resolvers = saturn.createResolvers();
```

Note that `apollo-tools` is not a dependency of this library. This is to avoid
any duplication or version misatches of the `graphql` package.

## File layouts

Each directory should have an `index.js` or `index.ts` file.

You can also split up the definitions into multiple files, like so:

```
- index.js
- queries.js
- mutations.js
- type.js
```

### Types

This string is copied as-is into the schema types.

``` javascript
export const type = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }
`;
```

### Query Types

This is used to define fields on the "RootQuery" type.

``` javascript
export const typeQuery = `
  posts: [Post]
  author(id: Int!): Author
`;
```

### Mutation Types

This is used to define mutations.

``` javascript
export const typeMutation = `
  upvotePost(postId: Int!): Post
`;
```

### Subscription Types

This is used to define subscriptions.

``` javascript
export const typeSubscription = `
  postAdded(): Post
`;
```

### Resolvers

This is used to implement the resolving functions for any types.

``` javascript
export const resolvers = {
  Author: {
    posts: author => filter(posts, { authorId: author.id }),
  },
  Post: {
    author: post => find(authors, { id: post.authorId }),
  },
};
```

### Queries

This is used to implement the RootQuery field resolvers.

``` javascript
export const queries = {
  posts: () => posts,
  author: (_, { id }) => find(authors, { id }),
};
```

### Mutations

This is used to implement the Mutation handlers.

``` javascript
export const mutations = {
  upvotePost: (_, { postId }) => {
    const post = find(posts, { id: postId });
    if (!post) {
      throw new Error(`Couldn't find post with id ${postId}`);
    }
    post.votes += 1;
    return post;
  },
};
```

### Subscriptions

This is used to implement the Subscription handlers.

``` javascript
export const subscriptions = {
  postAdded: {
    subscribe: () => ({
      async next() {
        const post = await waitForPostToBeCreated()
        return {
          value: post,
          done: false
        }
      },
      async return() {
        return {
          value: undefined,
          done: true
        }
      },
      async throw(error) {
        throw error
      },
      [Symbol.asyncIterator]() {
        return this
      }
    })
  },
};
```


## License

```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
