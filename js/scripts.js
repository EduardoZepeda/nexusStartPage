sections.sort(); //Sort sections alphabeticaly

var URL = Backbone.Model.extend({
  defaults: {
    name: '',
    url: '',
    section: ''
  },

  validate: function(attrs) {
    var regex = /[#$^()\[\]{}|<>]/g;
    $('.successMsg').text(""); //Delete success msg
    if (attrs.name.length <= 1) {
      $("#ErrorName").text(" *The name must be longer than one character. ");
      return "The name must be longer than one character"
    }
    if (regex.test(attrs.name)) {
      $("#ErrorName").text(" *No #$^()[]{}|<> is allowed");
      return "No #$^()[]{}|<> is allowed"
    }
    $("#ErrorName").text("");
    if (attrs.url.length <= 1) {
      $("#errorUrl").text(" *The URL must be longer than one character.");
      return "The URL must be longer than one character"
    }
    if(regex.test(attrs.url)){
      $("#errorUrl").text(" *No #$^()[]{}|<> is allowed");
      return "No #$^()[]{}|<> is allowed"
    }
    $("#errorUrl").text("");
  }
})

//Start Backbone's sollection
var collecttionUrlList = Backbone.Collection.extend({})

var list = new collecttionUrlList();

//Website's individual view
//Its only use is to render individual websites
var vistaURL = Backbone.View.extend({
  model: new URL(),
  tagName: "div",
  className: "url",
  initialize: function() {
    this.template = _.template($('#UrlTemplate').html());
    //Secondary template, create edit form
    this.formulario = _.template($('#formularioEdicion').html())
  },

  events: {
    'mouseenter .wrapperUrl': 'showModifiyIcons',
    'mouseleave .wrapperUrl': 'hideModifiyIcons',
    'click .glyphicon-pencil': 'edit',
    'dblclick .glyphicon-minus-sign': 'delete'

  },
  //Show edit and delete glyphicons
  showModifiyIcons: function() {
    this.$el.find('span').show();
  },
  //Hide edit and delete glyphicons
  hideModifiyIcons: function() {
    this.$el.find('span').hide();
  },

  edit: function() {
    var self = this;
    //Disable add websites form
    $('#formAgregarURL fieldset').attr('disabled', 'true');
    //Trigger a click event to close already opened forms
    $('.closeEdit').click();
    //Replace the $el attribute with the edit form
    this.$el.html(this.formulario(this.model.toJSON()));
    //Fill the input with the variable sections
    for (var i = 0; i < sections.length; i++) {
      $('#editSections').append(`<option val="${sections[i]}">${sections[i]}</option>`)
    }
    //Sets the section in the edit form
    $('#editSections').val(this.model.get('section'));

    $('.editModel').click(function() {
      //Set the values in the backbone model
      self.model.set({
        name: $('.editName').val(),
        url: $('.editURL').val(),
        section: $('#editSections').val()
      });
      self.render(); //Render the previous changes
      $('#formAgregarURL fieldset').removeAttr('disabled'); //Enable the add websites form
      localStorage.setItem('websitesList', JSON.stringify(list)); //Save changes using localStorage
    });

    //Pressing the button close renders the element again
    $('.closeEdit').click(function() {
      self.render();
      $('#formAgregarURL fieldset').removeAttr('disabled');
    })
  },

  delete: function() {
    //Delete the model and save changes using localStorage
    list.remove([this.model]);
    localStorage.setItem('websitesList', JSON.stringify(list));
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
})

var UrlListView = Backbone.View.extend({
  model: list,
  el: $('.UrlList'), //The div where all the models will be added
  initialize: function() {
    var self = this;
    this.model.on('add', this.render, this);
    this.model.on('remove', this.render, this);
    this.model.on('change', this.render, this); //Add an event handler to the collection
  },

  render: function() {
    var self = this;
    this.$el.html(''); //Cleans all the HTML to prevent stacking the websites
    var counter = 0;
    //Convert the collection to an array and iterate over it
    //Sort the array alphabeticaly using sortBy
    //It prevents changing the section's order after a model has been edited
    _.each(_.sortBy(this.model.toArray(), function(elemento) {
      return elemento.get('section')
    }), function(sitio) {
      if ($('#' + sitio.get('section')).length > 0) {
        //If the section already exist, append the new website to it
        $('#' + sitio.get('section')).append(new vistaURL({
          model: sitio
        }).render().$el);
      } else {
        if (counter == 0 || counter % 4 == 0) {
          //Add 4 columns to ech row (4x3 = 12(desired number))
          self.$el.append('<div class="row"></div>');
        }
        //If it doesn't, add the respective section at the end and then append the model to it
        $('.row:last-child').append(`<div class="col-sm-3"><div class="box" id="${sitio.get('section')}"><h3>#${sitio.get('section')}</h3></div></div>`);
        counter += 1;
        $('#' + sitio.get('section')).append(new vistaURL({ //Render the respective model and append it to its section
          model: sitio
        }).render().$el);
      }
    })
    return this;
  }
});

var websitesView = new UrlListView(); //Create the Backbone's view
try {
  //Try to load the localStorage item, show any error on screen
  var loadedList = JSON.parse(localStorage.getItem('websitesList'));
} catch (error) {
  document.getElementsByTagName('body').innerHTML = error.message;
}
list.add(loadedList);


$(document).ready(function() {
  //Renders all sections
  websitesView.render();
  //Fills the input select with the specified sections
  for (var i = 0; i < sections.length; i++) {
    $('#sections').append(`<option>${sections[i]}</option>`)
  }
  //Add website in the Add website's modal
  $('.saveUrl').click(function() {
    var name = $('#name').val();
    var url = $('#url').val();
    var section = $('#sections').val();
    var newSite = new URL();
    newSite.set({
      name: name,
      url: url,
      section: section
    })
    if (newSite.isValid()) {
      list.add(newSite);
      //Once the new website has been added, empty the fields and save the changes using localStorage
      var name = $('#name').val('');
      var url = $('#url').val('');
      localStorage.setItem('websitesList', JSON.stringify(list));
      $('.successMsg').text(" *Your website has been added");
    }

  });
  //Add an https:// to the url field
  $('#url').focus(function() {
    $(this).val('https://')
  });

  $('.glyphicon-plus').click(function() {
    //Deletes all success or error messages inside the modal
    $("#ErrorName").text("");
    $("#errorUrl").text("");
    $('.successMsg').text("");
  });

  //Delete all websites from localStorage
  $('.DeleteWebsites').click(function() {
    list.reset();
    websitesView.render();
    localStorage.removeItem('websitesList');
  })
})
