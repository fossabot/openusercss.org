import log from 'chalk-console'
import mongodb from 'mongodb'
import {sync as getConfig,} from 'lib/config'
import {cloneDeep,} from 'lodash'

const connect = () => new Promise((resolve, reject) => {
  const config = getConfig()
  const connectionUrl = config.get('database.main')

  mongodb.connect(connectionUrl, {
    'useNewUrlParser': true,
  }, (error, client) => {
    if (error) {
      return reject(error)
    }

    const db = client.db('openusercss-main')

    return resolve({
      'db': {
        'Theme':   db.collection('themes'),
        'User':    db.collection('users'),
        'Rating':  db.collection('ratings'),
        'Session': db.collection('sessions'),
      },
    })
  })
})

export default async ({User, Theme, Rating, Session,}) => {
  const userSaves = []
  const themeSaves = []
  const ratingSaves = []
  const sessionSaves = []
  const {db,} = await connect()
  const users = cloneDeep(await db.User.find({}).toArray())
  const themes = await db.Theme.find({}).toArray()
  const ratings = await db.Rating.find({}).toArray()
  const sessions = await db.Session.find({}).toArray()

  const userMap = {}

  users.forEach((user) => {
    if (user.display) {
      return null
    }

    const newUser = new User({
      'createdAt': new Date(user.createdAt),
      'updatedAt': new Date(user.lastUpdate),
      'display':   user.displayname,

      'email':          user.email,
      'pendingEmail':   user.pendingEmail,
      'emailVerified':  user.emailVerified,
      'password':       user.password,
      'lastSeenAt':     new Date(user.lastSeen),
      'lastSeenReason': user.lastSeenReason,
      'bio':            user.bio,
      'donationUrl':    user.donationUrl,
      'avatarUrl':      user.avatarUrl,
      'smallAvatarUrl': user.smallAvatarUrl,
    })

    newUser.createdBy = newUser.id
    newUser.updatedBy = newUser.id

    userSaves.push(
      db.User.deleteOne({
        '_id': user._id,
      })
      .then(() => log.info(`Deleted user ${user._id}`))
      .then(() => newUser.save())
      .then((saved) => {
        userMap[user._id.toString()] = saved.id
        return saved
      })
      .then((saved) => log.info(`Migrated user ${user._id} to ${saved.id}`))
      .catch((error) => {
        log.error(`Migration failed for ${user._id}:\n\t${error.message}`)
        log.error(error.stack)

        db.User.insertMany([ user, ])
        .then(() => log.info(`Restored user ${user._id} due to migration failure`))

        throw error
      })
    )
  })

  await Promise.all(userSaves)

  const themeMap = {}

  themes.forEach((theme) => {
    if (theme.display) {
      return null
    }

    const newTheme = new Theme({
      'createdAt': new Date(theme.createdAt),
      'updatedAt': new Date(theme.lastUpdate),
      'createdBy': userMap[theme.user],
      'updatedBy': userMap[theme.user],
      'display':   theme.title,

      'description': theme.description,
      'content':     theme.content,
      'version':     theme.version,
      'license':     theme.license,
      'screenshots': theme.screenshots
      .filter((url) => Boolean(url.length))
      .map((url) => ({
        url,
      })),
      'variables': cloneDeep(theme.variables),
    })

    themeSaves.push(
      db.Theme.deleteOne({
        '_id': theme._id,
      })
      .then(() => log.info(`Deleted theme ${theme._id}`))
      .then(() => newTheme.save())
      .then((saved) => {
        themeMap[theme._id.toString()] = saved.id
        return saved
      })
      .then((saved) => log.info(`Migrated theme ${theme._id} to ${saved.id}`))
      .catch((error) => {
        log.error(`Migration failed for ${theme._id}:\n\t${error.message}`)
        log.error(error.stack)

        db.Theme.insertMany([ theme, ])
        .then(() => log.info(`Restored theme ${theme._id} due to migration failure`))

        throw error
      })
    )
  })

  await Promise.all(themeSaves)

  ratings.forEach((rating) => {
    if (rating.updatedAt) {
      return null
    }

    let value = 1

    if (rating.value < 3) {
      value = -1
    }

    const newRating = new Rating({
      'createdAt': new Date(rating.createdAt),
      'updatedAt': new Date(rating.lastUpdate),

      'createdBy': userMap[rating.user],
      'theme':     themeMap[rating.theme],
      value,
    })

    ratingSaves.push(
      db.Rating.deleteOne({
        '_id': rating._id,
      })
      .then(() => log.info(`Deleted rating ${rating._id}`))
      .then(() => newRating.save())
      .then((saved) => log.info(`Migrated rating ${rating._id} to ${saved.id}`))
      .catch((error) => {
        log.error(`Migration failed for ${rating._id}:\n\t${error.message}`)
        log.error(error.stack)

        db.Rating.insertMany([ rating, ])
        .then(() => log.info(`Restored rating ${rating._id} due to migration failure`))

        throw error
      })
    )
  })

  await Promise.all(ratingSaves)

  sessions.forEach((session) => {
    if (session.display) {
      return null
    }

    const newSession = new Session({
      'createdAt': new Date(session.createdAt),
      'updatedAt': new Date(session.createdAt),
      'createdBy': userMap[session.user],
      'updatedBy': userMap[session.user],
      'display':   'A session',

      'expiresAt': new Date(session.expiresAt),
      'token':     session.token,
      'ip':        session.ip,
      'ua':        session.ua,
    })

    sessionSaves.push(
      db.Session.deleteOne({
        '_id': session._id,
      })
      .then(() => log.info(`Deleted session ${session._id}`))
      .then(() => newSession.save())
      .then((saved) => log.info(`Migrated session ${session._id} to ${saved.id}`))
      .catch((error) => {
        log.error(`Migration failed for ${session._id}:\n\t${error.message}`)
        log.error(error.stack)

        db.Session.insertMany([ session, ])
        .then(() => log.info(`Restored session ${session._id} due to migration failure`))

        throw error
      })
    )
  })

  await Promise.all(sessionSaves)

  log.info('All items migrated')
}
