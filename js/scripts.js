$(document).ready(function () {
  if (window.localStorage) {
    console.log('Welcome to the Nexus!')
  } else {
    document.body.innerHTML = 'This page requires localStorage to function properly, please activate it.'
    throw new Error('This page requires localStorage to function properly, please activate it.')
  }
  sections.sort() // Sort sections alphabeticaly
  try {
    // Try to load the localStorage item, show any error on screen
    var loadedList = JSON.parse(localStorage.getItem('websitesList'))
  } catch (error) {
    document.getElementsByTagName('body').innerHTML = error.message
  }
  list.add(loadedList)
  websitesView.startListeningEvents()

  $('.deleteAllSites').click(function () {
    // Delete all websites from localStorage
    list.reset()
    websitesView.render()
    localStorage.removeItem('websitesList')
  })
})
