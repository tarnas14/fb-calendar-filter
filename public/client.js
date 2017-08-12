const domReady = new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve)) 

window.giveUserFilteredCalendarUri = () => {
  domReady.then(() => {
    const fbCalUri = document.getElementById('fbCalendarUri').value
 
    if (!fbCalUri.trim()) {
      return
    }

    const regex = /^webcal:\/\/www.facebook.com\/ical\/u.php\?uid=(\d+)&key=(.+)$/
    const [match, uid, key] = fbCalUri.match(regex)

    const queryParts = [
      document.getElementById('acceptedEvents').checked && 'accepted',
      document.getElementById('maybeEvents').checked && 'maybe',
      document.getElementById('notRespondedEvents').checked && 'notResponded'
    ]

    const filteredLink = `${window.location.origin}/cal/${uid}/${key}/?${
      queryParts.filter(e => Boolean(e)).map(name => `${name}=true`).join('&')
    }`.replace(window.location.protocol, 'webcal:')
    
    const container = document.getElementById('filteredCalendarUri')
    container.className = container.className.replace('untouched', '').trim()
    container.innerText = filteredLink
  })
}

domReady.then(() => {
  [
    document.getElementById('acceptedEvents'),
    document.getElementById('maybeEvents'),
    document.getElementById('notRespondedEvents')
  ].forEach(element => element.addEventListener('change', window.giveUserFilteredCalendarUri))
  document.getElementById('fbCalendarUri').addEventListener('input', window.giveUserFilteredCalendarUri)
})
