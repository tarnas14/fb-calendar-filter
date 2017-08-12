document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.switch').forEach(element => {
    element.addEventListener('change', event => {
      const label = event.target.parentNode
      label.className = label.className.includes('checked')
        ? label.className.replace('checked', '').trim()
        : label.className + ' checked'
    })
  })
})
