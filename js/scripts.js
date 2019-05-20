$(document).ready(function() {
  if (window.localStorage) {
    console.log('Welcome to the Nexus!')
  } else {
    document.body.innerHTML = 'This page requires localStorage to function properly, please activate it.'
    throw new Error('This page requires localStorage to function properly, please activate it.')
  }
  $('form input').on('keypress', function(e) {
    return e.which !== 13; //No submit form on enter
});
  websitesView.startListeningEvents()
})
