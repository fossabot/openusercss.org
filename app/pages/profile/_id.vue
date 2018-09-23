<script>
  import moment from 'moment'

  import themeCard from '~/components/elements/theme-card.vue'
  import notification from '~/components/elements/notification.vue'
  import progressiveImage from '~/components/bits/progressive-image.vue'
  import bSwitch from '~/components/bits/b-switch.vue'
  import spinner from '~/components/elements/spinner.vue'

  import {mapGetters,} from 'vuex'
  import starRating from 'vue-star-rating'

  export default {
    'transition': 'fade-zoom',
    fetch ({store, route,}) {
      return Promise.all([
        store.dispatch('users/single', route.params.id),
        store.dispatch('themes/user', route.params.id),
      ])
    },
    'components': {
      themeCard,
      notification,
      progressiveImage,
      starRating,
      bSwitch,
      spinner,
    },
    beforeMount () {
      this.timeInterval = setInterval(() => {
        this.time = moment()
      }, 20000)
    },
    mounted () {
      if (this.viewer && this.viewer.id === this.$route.params.id) {
        this.viewingOwn = true
      }
    },
    beforeDestroy () {
      clearInterval(this.timeInterval)
    },
    'methods': {
      isOnline (date) {
        return moment(this.time).diff(date) < 600000
      },
      // views (id) {
      //   return this.$store.getters['stats/theme'](id)
      // },
      // getUserStats () {
      //   if (this.showStats) {
      //     const gets = []
      //
      //     this.themes.forEach((theme) => {
      //       gets.push(this.$store.dispatch('stats/hits', theme.id,))
      //     })
      //
      //     return Promise.all(gets)
      //   }
      // },
    },
    data () {
      return {
        'time':        moment(),
        'showStats':   null,
        'sortBy':      'createdAt',
        'sortReverse': null,
        'viewingOwn':  false,
        'filter':      '',
      }
    },
    'computed': {
      ...mapGetters({
        'viewer':       'session/viewer',
        'statsError':   'stats/error',
        'statsLoading': 'stats/loading',
      }),
      sortOptions () {
        return [
          {
            'title': 'Date created',
            'value': 'createdAt',
          },
          {
            'title': 'Last update',
            'value': 'lastUpdate',
          },
          {
            'title': 'License',
            'value': 'license',
          },
          {
            'title': 'Version',
            'value': 'version',
          },
          {
            'title': 'Title',
            'value': 'title',
          },
          {
            'title': 'Visits',
            'value': 'stats.visits',
          },
        ]
      },
      averageRating () {
        const ratings = this.$store.getters['ratings/theme'](this.$route.params.id)
        let sum = 0

        ratings.forEach((rating) => {
          sum = sum + rating.value
        })

        const result = Math.round(sum / ratings.length * 100) / 100

        if (isNaN(result)) {
          return null
        }

        return result
      },
      user () {
        return this.$store.getters['users/all'].find((user) => user.id === this.$route.params.id)
      },
      themes () {
        return this.$store.getters['themes/all'].filter((theme) => theme.user.id === this.$route.params.id)
      },
      lastOnlineDisplay () {
        const user = this.user

        return `Last seen ${user.lastSeenReason}, ${moment(this.time).to(user.lastSeenAt)}`
      },
    },
  }
</script>

<style lang="scss" scoped>
  .is-inline {
    display: inline-flex;
    flex-direction: row;
  }

  .is-fullwidth {
    width: 100%;
  }
</style>

<template lang="pug">
  include ../../components/static/microdata/user.pug
  include ../../components/static/microdata/theme.pug
  include ../../components/static/theme-card.pug

  .ouc-route-root
    +user-microdata

    .container.ouc-profile-container
      .ouc-profile-wrapper
        .section
          .level
            .level-left
              h1 {{user.displayname | placeholder('Profile')}}
            .level-right.ouc-profile-action-buttons(v-show="viewer && viewer.id === user.id")
              .tile.is-parent.is-paddingless.is-brand-primary
                .tile.ouc-new-theme-button-wrapper.is-child
                  nuxt-link.button.is-backgroundless.is-borderless.has-text-white.ouc-new-theme-button(to="/theme/edit")
                    | Upload new theme
                .tile.ouc-account-button-wrapper.is-child
                  nuxt-link.button.is-backgroundless.is-borderless.has-text-white.ouc-account-button(to="/account")
                    | Account
          .columns
            .column.is-6
              .card
                .card-content.is-brand-primary
                  .columns
                    .column.is-4.is-hcentered
                      figure.image.has-indicator
                        fa-icon(v-if="isOnline(user.lastSeenAt)", icon="circle", color="#06BC5A")
                        progressive-image(
                          :src="user.avatarUrl",
                          :placeholder="user.smallAvatarUrl",
                          height="7.5rem",
                          width="7.5rem",
                          size="cover",
                          position="center center",
                          :circular="true"
                        )
                    .column.is-8
                      p @{{user.username}}
                      hr
                      p.ouc-last-seen {{lastOnlineDisplay}}

                .card-content
                  .content.ouc-user-bio-wrapper
                    vue-markdown.ouc-user-bio(
                      v-if="user.bio",
                      :source="user.bio",
                      :html="false",
                      :anchor-attributes="$anchorAttributes"
                    )
                    p(v-else)
                      | {{user.display}} has not written a bio yet.

              div(v-if="viewingOwn")
                hr
                .card.is-paddingless
                  table.table.is-striped.is-fullwidth.is-hoverable
                    thead
                      tr
                        td(colspan="2")
                          b View settings
                    tbody
                      tr
                        td
                          label(for="showStatsToggle")
                            | Show statistics
                        td.has-text-right
                          b-switch#showStatsToggle(
                            v-model="showStats"
                          )

                      tr
                        td
                          label(for="sortByDropdown")
                            | Sort by
                        td.has-text-right
                          .select
                            select#sortByDropdown(v-model="sortBy")
                              option(
                                v-for="option in sortOptions",
                                :key="option.value",
                                :value="option.value"
                              )
                                | {{option.title}}

                      tr
                        td
                          label(for="sortReverseToggle")
                            | Reverse order
                        td.has-text-right
                          b-switch#sortReverseToggle(
                            ref="sortReverseToggle"
                            v-model="sortReverse"
                          )

            .column.is-6
              .ouc-user-donation-wrapper(v-if="user.donationUrl && user.donationUrl !== ''", is-paddingless)
                a.button.is-primary(:href="user.donationUrl", target="_blank", rel="nofollow noopener")
                  | Support {{user.displayname}}'s themes by donating
                hr

              input.input.has-bottom-margin(placeholder="Filter themes", v-model="filter")

              .columns.is-multiline(v-if="viewingOwn")
                nuxt-link.column.is-12(
                  v-for="(theme, index) in filterBy(orderBy(themes, sortBy, sortReverse ? 0 : -1), filter)",
                  :key="theme.id",
                  :to="'/theme/' + theme.id"
                )
                  +theme-microdata
                  .box
                    .level
                      b {{theme.title}}

                      p(v-if="sortBy === 'createdAt'")
                        | {{sortOptions.find((option) => option.value === sortBy).title}}:
                        | {{theme[sortBy] | moment('from', 'now')}}
                      p(v-else-if="sortBy === 'updatedAt'")
                        | {{sortOptions.find((option) => option.value === sortBy).title}}:
                        | {{theme[sortBy] | moment('from', 'now')}}
                      p(v-else-if="sortBy === 'stats.visits'")
                        | {{sortOptions.find((option) => option.value === sortBy).title}}:
                        | {{theme.stats.visits}}
                      p(v-else)
                        | {{sortOptions.find((option) => option.value === sortBy).title}}:
                        | {{theme[sortBy]}}

                    transition(name="fade-zoom")
                      .level(v-if="showStats")
                        p
                          span(v-if="theme.stats.views")
                            | Unique visits: {{theme.stats.visits}}
                            br
                          | Total views: {{theme.stats.views}}
                          span(v-if="theme.stats.avgRetention")
                            br
                            | Average retention time: {{theme.stats.avgRetention}} seconds

              .columns.is-multiline(v-else)
                nuxt-link.column.is-6(
                  v-for="(theme, index) in themes",
                  :key="theme.id",
                  :to="'/theme/' + theme.id"
                )
                  +theme-microdata
                  +theme-card(true)
                    //- TODO: Get install count!
                    //- p.subtitle Installs: {{parseInt(Math.random() * 100, 10)}}
</template>
