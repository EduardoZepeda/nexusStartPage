try {
  var sitesInLocalStorage = JSON.parse(localStorage.getItem('listOfSectionAndSites')) || []
  urlCollection.add(sitesInLocalStorage)

} catch (error) {
  document.getElementsByTagName('body').innerHTML = error.message
}
