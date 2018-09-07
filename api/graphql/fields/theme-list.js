import {pick,} from 'lodash'

export default {
  'query': 'themeList',

  async root (root, {input,}, {Theme, Rating,}) {
    const {sort, limit = 50, skip = 0,} = input
    const themes = await Theme.find({}, null, {
      'limit': Math.min(limit, 50),
      'skip':  Math.max(skip, 0),
    }).sort(pick(sort, 'creatdAt', 'updatedAt', 'display'))

    if (typeof sort.ratings === 'number') {
      const ratings = await Rating.find({
        'theme': {
          '$in': themes,
        },
      })

      themes.sort((a, b) => {
        const aRatings = ratings.filter((item) => item.theme.toString() === a.id)
        const bRatings = ratings.filter((item) => item.theme.toString() === b.id)

        if (aRatings.length > bRatings.length) {
          return 0 + sort.ratings
        }

        return 0 - sort.ratings
      })
    }

    return themes
  },
}
