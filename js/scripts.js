$(document).ready(function() {
  sections.sort(); //Sort sections alphabeticaly
  try {
    //Try to load the localStorage item, show any error on screen
    var loadedList = JSON.parse(localStorage.getItem('websitesList'));
  } catch (error) {
    document.getElementsByTagName('body').innerHTML = error.message;
  }
  list.add(loadedList);

  $('.deleteAllSites').click(function(){
    //Delete all websites from localStorage
    list.reset();
    websitesView.render();
    localStorage.removeItem('websitesList');
  })

})
