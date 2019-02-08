exports.type = `
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
`

exports.typeQuery = `
  posts: [Post]
  author(id: Int!): Author
`

exports.typeMutation = `
  upvotePost(postId: Int!): Post
`
