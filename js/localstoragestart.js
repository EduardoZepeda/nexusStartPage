try {
  // Try to load the localStorage item, show any error on screen
  var loadedSectionss = JSON.parse(localStorage.getItem('sectionList')) || []
  var loadedList = JSON.parse(localStorage.getItem('websitesList'))
} catch (error) {
  document.getElementsByTagName('body').innerHTML = error.message
}
sectionss.add(loadedSectionss)
list.add(loadedList)
