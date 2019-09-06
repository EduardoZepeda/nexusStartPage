$(document).ready(function() {
  if (window.localStorage) {
    console.log('Welcome to the Nexus!')
  } else {
    document.body.innerHTML = 'This page requires localStorage to function properly, please activate it.'
    throw new Error('This page requires localStorage to function properly, please activate it.')
  }
  $('form input').on('keyup', function(e) {
    if (this.value == '') {
      this.classList.add('error-input')
    } else {
      this.classList.remove('error-input')
    }
  });
})
