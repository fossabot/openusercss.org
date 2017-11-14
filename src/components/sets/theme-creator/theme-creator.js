import {bulmaComponentGenerator as bulma} from 'vue-bulma-components'
import {mapGetters} from 'vuex'
import noSSR from 'vue-no-ssr'

import icon from '../icon/icon.vue'
import notification from '../notification/notification.vue'
import editor from '../editor/editor.vue'

import bInput from '../b-input/b-input.vue'
import bTextarea from '../b-textarea/b-textarea.vue'

const customDictionary = {
  'en': {
    'custom': {
      'content': {
        'required': 'Theme code must not be empty.'
      }
    }
  }
}

// eslint-disable-next-line
console.warn('You\'re still using this component, which is deprecated (in-sets)')

const getters = mapGetters([
  'user'
])

export default {
  'components': {
    'b-columns':     bulma('columns', 'div'),
    'b-column':      bulma('column', 'div'),
    'b-box':         bulma('box', 'div'),
    'b-section':     bulma('section', 'div'),
    'b-container':   bulma('container', 'div'),
    'b-field':       bulma('field', 'div'),
    'b-label':       bulma('label', 'label'),
    // 'b-input':       bulma('input', 'input'),
    // 'b-textarea':    bulma('textarea', 'textarea'),
    'b-select':      bulma('select', 'select'),
    'b-control':     bulma('control', 'div'),
    'b-checkbox':    bulma('checkbox', 'checkbox'),
    'b-radio':       bulma('radio', 'radio'),
    'b-button':      bulma('button', 'button'),
    'b-help':        bulma('help', 'p'),
    'b-tile':        bulma('tile', 'div'),
    'b-level':       bulma('level', 'div'),
    'b-level-left':  bulma('level-left', 'div'),
    'b-level-right': bulma('level-right', 'div'),
    'no-ssr':        noSSR,
    icon,
    notification,
    editor,
    bInput,
    bTextarea
  },
  'data': () => {
    return {
      'theme': {
        'title':       '',
        'description': '',
        'scope':       '',
        'content':     ''
      },
      // eslint-disable-next-line
      'regex': /((?![*+?])(?:[^\r\n\[\/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)/
    }
  },
  created () {
    this.$validator.updateDictionary(customDictionary)
  },
  'methods': {
    'user': getters.user,
    async submit () {
      const validated = await this.$validator.validateAll()

      if (validated) {
        this.$store.dispatch('createTheme', {
          'theme': {
            'title':       this.theme.title,
            'description': this.theme.description,
            'scope':       this.theme.scope,
            'content':     this.theme.content
          },
          // eslint-disable-next-line no-underscore-dangle
          'redirect': `/profile/${this.user()._id}`
        })
      }
    }
  },
  'computed': mapGetters([
    'actionErrors'
  ])
}