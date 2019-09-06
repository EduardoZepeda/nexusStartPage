var URL = Backbone.Model.extend({
  defaults: {
    name: '',
    url: '',
    reference: ''
  },

  validate: function(attrs) {
    var regex = /[$^()\[\]{}|<>]/g
    if (attrs.name.length <= 1) {
      return 'The name must be longer than one character'
    }
    if (regex.test(attrs.name)) {
      return 'No $^()[]{}|<> is allowed'
    }
    if (attrs.url.length <= 1) {
      return 'The URL must be longer than one character'
    }
    if (regex.test(attrs.url)) {
      return 'No $^()[]{}|<> is allowed'
    }
  }
})

var section = Backbone.Model.extend({
  defaults: {
    name: '',
    content: []
  },
  validate: function(attrs) {
    if (attrs.name.length <= 1) {
      return 'The section name must be longer than one character'
    }
  }
})
