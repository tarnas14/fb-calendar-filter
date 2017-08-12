const express = require('express')
const request = require('request')
const ical2json = require('ical2json')
const path = require('path')
const Readable = require('stream').Readable

const app = express()

app.use(express.static('public'))

const getFbCal = ({uid, key}) => new Promise(resolve => {
  const link = `https://web.facebook.com/ical/u.php?uid=${uid}&key=${key}`

  request
    .get({
      url: link,
      headers: {
        'User-Agent': 'fb calendar filter'
      }
    })
    .on('response', res => {
      const parts = []
      res.on('data', part => parts.push(part.toString()))

      res.on('end', () => resolve(ical2json.convert(parts.join(''))))
    })
})

const filterCal = ({going, maybe, notResponded}) => jsonCal => {
  const acceptedPartstat = [
    going && 'ACCEPTED',
    maybe && 'TENTATIVE',
    notResponded && 'NEEDS-ACTION'
  ]

  return Object.assign({}, jsonCal, {
    VCALENDAR: jsonCal.VCALENDAR.map(calendar => Object.assign({}, calendar, {
      VEVENT: calendar.VEVENT.filter(event => acceptedPartstat.includes(event.PARTSTAT))
    }))
  })
}

app.get('/cal/:uid/:key/', (request, response) => {
  getFbCal(request.params)
    .then(filterCal(request.query))
    .then(filteredCal => {
      const filteredICal = ical2json.revert(filteredCal)

      const s = new Readable()
      s._read = () => {}
      s.push(filteredICal)
      s.push(null)

      response.setHeader('content-disposition', 'attachmenth; filename=fbFilter' + request.params.uid + '.ics')
      response.setHeader('content-type', 'text/calendar')
      s.pipe(response)
    })
})

app.get('/', (_, response) => {
  response.sendFile(path.resolve(__dirname, 'index.html'))
})

const listener = app.listen(process.env.PORT || 3000, () => console.log(`FB calendar filter is listening on port ${listener.address().port}`))

