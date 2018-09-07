import mongoose, {crud, Schema,} from '../interface/crud'

const ratingSchema = crud({
  'theme': {
    'type':     Schema.Types.ObjectId,
    'ref':      'Theme',
    'required': true,
  },
  'value': {
    'type':     Number,
    'required': true,
    'validate': {
      validator (value) {
        return [-1, 1,].includes(value)
      },
      message (props) {
        return `${props.value} is not a valid rating (must be 1 or -1)`
      },
    },
  },
})

export const Rating = mongoose.model('Rating', ratingSchema)
