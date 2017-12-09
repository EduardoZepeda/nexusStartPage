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
    'click .editSite': 'edit',
    'dblclick .deleteSite': 'delete'

  },
  //Show edit and delete glyphicons
  showModifiyIcons: function() {
    this.$el.find('.editSite').show();
    this.$el.find('.deleteSite').show();
  },
  //Hide edit and delete glyphicons
  hideModifiyIcons: function() {
    this.$el.find('.editSite').hide();
    this.$el.find('.deleteSite').hide();
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
    _.each(_.sortBy(this.model.toArray(), function(element) {
      return element.get('section')
    }), function(site) {
      console.log(site);
      if ($('#' + site.get('section')).length > 0) {
        //If the section already exist, append the new website to it
        $('#' + site.get('section')).append(new vistaURL({
          model: site
        }).render().$el);
      } else {
        if (counter == 0 || counter % 4 == 0) {
          //Add 4 columns to ech row (4x3 = 12(desired number))
          self.$el.append('<div class="row"></div>');
        }
        //If it doesn't, add the respective section at the end and then append the model to it
        $('.row:last-child').append(`<div class="col-sm-3"><div class="box" id="${site.get('section')}"><h3>${site.get('section')}</h3></div></div>`);
        counter += 1;
        $('#' + site.get('section')).append(new vistaURL({ //Render the respective model and append it to its section
          model: site
        }).render().$el);
      }
    })
    return this;
  }
});

var websitesView = new UrlListView(); //Create the Backbone's view


var AddForm = Backbone.View.extend({
  model: list,
  el: $('.addFormRendered'),
  initialize: function(){
    this.template = _.template($('#addFormTemplate').html());
    this.render();
  },
  events:{
    'click .saveUrl': 'saveSite',
    'click .addSite': 'emptyAddSiteForm',
    'focus #url': 'addHttpsText'
  },
  render: function(){
    this.$el.html('');
    this.$el.html(this.template(this.model.toJSON()));
    //Fills the input select with the specified sections
    for (var i = 0; i < sections.length; i++) {
      $('#sections').append(`<option>${sections[i]}</option>`)
    }
  },

  emptyAddSiteForm: function(){
    $('#formAgregarURL fieldset').removeAttr('disabled'); 
    $("#ErrorName").text("");
    $('#name').val("");
    $('#url').val("");
    $("#errorUrl").text("");
    $('.successMsg').text("");
  },


  addHttpsText: function(e){
    //e.currentTarget refers to the element that fired the event
    if($(e.currentTarget).val()==''){
    $(e.currentTarget).val('https://')
    }
  },

  saveSite: function(){
    var self = this;
    var name = $('#name').val();
    var url = $('#url').val();
    var section = $('#sections').val();
    var newUrl = new URL();
    newUrl.set({
      name:name,
      url:url,
      section:section
    });
    if (newUrl.isValid()) {
      //If the new website is valid, add it to the list (self.model)
      //Once the new website has been added, empty the fields and save the changes using localStorage
      self.model.add(newUrl);
      $('#name').val('');
      $('#url').val('');
      localStorage.setItem('websitesList', JSON.stringify(list));
      $('.successMsg').text(" *Your website has been added");
  }
}
});
var AddFormView = new AddForm();
