import client from '~/lib/apollo-client'
import rateMutation from '~/apollo/mutations/rate.gql'

export const state = () => ({
  'loading': false,
  'ratings': [],
})

export const getters = {
  theme (state) {
    return (id) => {
      return state.ratings.filter((rating) => rating.theme.id === id)
    }
  },
}

export const mutations = {
  upsert (state, ratings) {
    // assert(Array.isArray(ratings), 'Ratings must be an array')
    if (Array.isArray(ratings)) {
      ratings.forEach((rating) => {
        const existingIndex = state.ratings.findIndex((item) => {
          return rating.id === item.id
        })

        if (existingIndex === -1) {
          state.ratings.push(rating)
        } else {
          state.ratings[existingIndex] = rating
        }
      })
    } else {
      const rating = ratings
      const existingIndex = state.ratings.findIndex((item) => {
        return rating.id === item.id
      })

      if (existingIndex === -1) {
        state.ratings.push(rating)
      } else {
        state.ratings[existingIndex] = rating
      }
    }
  },
}

export const actions = {
  async submit ({commit, state,}, {
    id,
    value,
  }) {
    const {data,} = await client.mutate({
      'mutation':  rateMutation,
      'variables': {
        id,
        value,
      },
    })

    commit('upsert', data.rate)
  },
}
