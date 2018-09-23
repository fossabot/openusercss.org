import {Theme,} from 'api/db/schema/theme'
import {stringify,} from 'usercss-meta'

export default async (req, res, next) => {
  const foundTheme = await Theme.findById(req.params.id).populate('createdBy')

  if (foundTheme) {
    const varsMap = {}

    foundTheme.variables.forEach((variable) => {
      varsMap[variable.name] = variable
    })

    res.type('css')
    res.write(stringify({
      'name':         foundTheme.title,
      'namespace':    `https://openusercss.org/theme/${foundTheme._id}`,
      'homepageURL':  `https://openusercss.org/theme/${foundTheme._id}`,
      'version':      foundTheme.version,
      'license':      foundTheme.license,
      'description':  foundTheme.description,
      'vars':         varsMap,
      'author':       `${foundTheme.createdBy.display} (https://openusercss.org/profile/${foundTheme.createdBy.id})`,
      'preprocessor': 'uso',
    }, {
      'alignKeys': true,
    }))
    res.write(`\n\n${foundTheme.content}\n`)
    res.send()
  } else {
    res.type('json')
    res.status('404')
    res.send({
      'data':   null,
      'errors': [
        {
          'code':    'ENOTFOUND',
          'message': 'No theme found',
          'id':      req.params.id,
        },
      ],
    })
  }
}
