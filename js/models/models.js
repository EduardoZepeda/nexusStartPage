
var URL = Backbone.Model.extend({
  defaults: {
    name: '',
    url: '',
    section: ''
  },

  validate: function(attrs) {
    var regex = /[$^()\[\]{}|<>]/g;
    $('.successMsg').text(""); //Delete success msg
    if (attrs.name.length <= 1) {
      $("#ErrorName").text(" *The name must be longer than one character. ");
      return "The name must be longer than one character"
    }
    if (regex.test(attrs.name)) {
      $("#ErrorName").text(" *No $^()[]{}|<> is allowed");
      return "No $^()[]{}|<> is allowed"
    }
    $("#ErrorName").text("");
    if (attrs.url.length <= 1) {
      $("#errorUrl").text(" *The URL must be longer than one character.");
      return "The URL must be longer than one character"
    }
    if(regex.test(attrs.url)){
      $("#errorUrl").text(" *No $^()[]{}|<> is allowed");
      return "No $^()[]{}|<> is allowed"
    }
    $("#errorUrl").text("");
  }
})
