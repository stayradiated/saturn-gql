import { find } from 'lodash'

import { Post } from '../types'
import { authors, posts } from '../data'

export const queries = {
  posts: () => posts,
}

interface UpvotePostArgs {
  postId: number,
}

export const mutations = {
  upvotePost: (_: void, args: UpvotePostArgs) => {
    const { postId } = args
    const post = find(posts, { id: postId })
    if (!post) {
      throw new Error(`Couldn't find post with id ${postId}`)
    }
    post.votes += 1
    return post
  },
}

export const resolvers = {
  Post: {
    author: (post: Post) => find(authors, { id: post.authorId }),
  },
}

export const type = `
  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }
`

export const typeQuery = `
  posts: [Post]
`

export const typeMutation = `
  upvotePost(postId: Int!): Post
`
