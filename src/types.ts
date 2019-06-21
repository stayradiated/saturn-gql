export interface DirExports {
  resolvers?: Record<string, Function>,
  queries?: Record<string, Function>,
  mutations?: Record<string, Function>,
  subscriptions?: Record<string, Function>,
  type?: string,
  typeQuery?: string,
  typeMutation?: string,
  typeSubscription?: string,
}
