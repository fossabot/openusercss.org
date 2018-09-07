import helmet from 'helmet'

export default async ({app, config, mode,}) => {
  const directives = {
    'defaultSrc': [
      "'self'",
    ],
    'scriptSrc': [
      "'self'",
      "'unsafe-inline'",
      'pwk.decentm.com',
      'sentry.io',
      'cdn.jsdelivr.net',
    ],
    'styleSrc': [
      "'self'",
      "'unsafe-inline'",
      'cdn.jsdelivr.net',
    ],
    'imgSrc': [
      "'self'",
      'data:',
      'imageproxy.openusercss.org',
      'imageproxy.openusercss.com',
      'pwk.decentm.com',
      'gravatar.com',
      'cdn.jsdelivr.net',
    ],
    'connectSrc': [
      'imageproxy.openusercss.org',
      'imageproxy.openusercss.com',
      'pwk.decentm.com',
      'gravatar.com',
      'sentry.io',
    ],
    'fontSrc': [
      'data:',
      "'self'",
    ],
    'workerSrc': [
      "'self'",
      'blob:',
    ],
  }

  let allowExtra = null

  if (config.get('env') === 'development') {
    allowExtra = [
      config.get('domain'),
      `api.${config.get('domain')}`,
      'unpkg.com',
    ]
  } else {
    allowExtra = [
      'staging.openusercss.org',
      'api.staging.openusercss.org',
      'staging.openusercss.com',
      'api.staging.openusercss.com',
      'openusercss.org',
      'api.openusercss.org',
      'openusercss.com',
      'api.openusercss.com',
    ]
  }

  allowExtra.forEach((resource) => {
    directives.defaultSrc.push(resource)
    directives.scriptSrc.push(resource)
    directives.styleSrc.push(resource)
    directives.connectSrc.push(resource)
  })

  app.use(helmet({
    'contentSecurityPolicy': {
      directives,
    },
    'dnsPrefetchControl': {
      'allow': false,
    },
    'frameguard': {
      'action': 'deny',
    },
    'hsts': {
      'maxAge': 60 * 60 * 24 * 60,
    },
    'referrerPolicy': {
      'policy': 'no-referrer',
    },
  }))
}
