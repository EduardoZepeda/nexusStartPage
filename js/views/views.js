// Website's individual view
// Its only use is to render individual websites
var vistaURL = Backbone.View.extend({
  model: new URL(),
  tagName: 'div',
  className: 'url',
  initialize: function () {
    this.template = _.template($('#UrlTemplate').html())
    // Secondary template, create edit form
    this.formulario = _.template($('#editionForm').html())
  },

  events: {
    'mouseenter .wrapperUrl': 'showModifiyIcons',
    'mouseleave .wrapperUrl': 'hideModifiyIcons',
    'click .editSite': 'edit',
    'dblclick .deleteSite': 'delete'

  },
  // Show edit and delete glyphicons
  showModifiyIcons: function () {
    this.$el.find('.editSite').show()
    this.$el.find('.deleteSite').show()
  },
  // Hide edit and delete glyphicons
  hideModifiyIcons: function () {
    this.$el.find('.editSite').hide()
    this.$el.find('.deleteSite').hide()
  },

  edit: function () {
    var self = this
    // Disable add websites form
    $('#formAgregarURL fieldset').attr('disabled', 'true')
    // Trigger a click event to close already opened forms
    $('.closeEdit').click()
    // Replace the $el attribute with the edit form
    this.$el.html(this.formulario(this.model.toJSON()))
    // Fill the input with the variable sections
    for (var i = 0; i < sections.length; i++) {
      $('#editSections').append(`<option val="${sections[i]}">${sections[i]}</option>`)
    }
    // Sets the section in the edit form
    $('#editSections').val(this.model.get('section'))

    $('.editModel').click(function () {
      // Set the values in the backbone model
      self.model.set({
        name: $('.editName').val(),
        url: $('.editURL').val(),
        section: $('#editSections').val()
      })
      self.render() // Render the previous changes
      $('#formAgregarURL fieldset').removeAttr('disabled') // Enable the add websites form
      localStorage.setItem('websitesList', JSON.stringify(list)) // Save changes using localStorage
    })

    // Pressing the button close renders the element again
    $('.closeEdit').click(function () {
      self.render()
      $('#formAgregarURL fieldset').removeAttr('disabled')
    })
  },

  delete: function () {
    // Delete the model and save changes using localStorage
    list.remove([this.model])
    localStorage.setItem('websitesList', JSON.stringify(list))
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()))
    return this
  }

})

var UrlListView = Backbone.View.extend({
  model: list,
  el: $('.UrlList'),
  initialize: function () {
    var self = this
  },

  startListeningEvents: function () {
    this.render()
    this.model.on('add', this.render, this)
    this.model.on('remove', this.render, this)
    this.model.on('change', this.render, this)
  },

  render: function () {
    var self = this
    this.$el.html('') // Cleans all the HTML to prevent stacking the websites
    var counter = 0
    // Convert the collection to an array and iterate over it
    // Sort the array alphabeticaly using sortBy
    // It prevents changing the section's order after a model has been edited
    _.each(_.sortBy(this.model.toArray(), function (element) {
      return element.get('section')
    }), function (site) {
      if ($('#' + site.get('section')).length > 0) {
        // If the section already exist, append the new website to it
        $('#' + site.get('section')).append(new vistaURL({
          model: site
        }).render().$el)
      } else {
        if (counter == 0 || counter % 4 == 0) {
          // Add 4 columns to ech row (4x3 = 12(desired number))
          self.$el.append('<div class="row"></div>')
        }
        // If it doesn't, add the respective section at the end and then append the model to it
        $('.row:last-child').append(`<div class="col-sm-3"><div class="box" id="${site.get('section')}"><h3>${site.get('section')}</h3></div></div>`)
        counter += 1
        $('#' + site.get('section')).append(new vistaURL({ // Render the respective model and append it to its section
          model: site
        }).render().$el)
      }
    })
    return this
  }
})

var websitesView = new UrlListView()

var AddForm = Backbone.View.extend({
  model: list,
  el: $('.addFormRendered'),
  initialize: function () {
    this.template = _.template($('#addFormTemplate').html())
    this.render()
  },
  events: {
    'click .saveUrl': 'saveSite',
    'click .addSite': 'emptyAddSiteForm',
    'focus #url': 'addHttpsText',
    'click .deleteAllSites': 'deleteAllSites',
    'click .downloadSites': 'downloadSites',
    'click .uploadFile': 'uploadFile',
    'change #fileElem': 'readSingleFile'
  },

  downloadSites: function () {
    if (this.model.length != 0) {
      var backupList = JSON.stringify(this.model)
      var hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(backupList)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'sitesBackup.txt'
      hiddenElement.click()
    } else {
      $('#errorTitle').text('There are no sites to backup')
      $('#errorText').text('You can\'t create a backup of an empty list.')
      $('#errorModal').modal('toggle')
    }
  },

  deleteAllSites: function () {
    // Delete all websites from localStorage
    this.model.reset()
    websitesView.render()
    localStorage.removeItem('websitesList')
  },

  uploadFile: function () {
    var el = document.getElementById('fileElem')
    if (el) {
      el.click()
    }
  },

  readSingleFile: function (evt) {
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]
    var self = this
    if (f) {
      var r = new FileReader()
      r.onload = function (e) {
	      var contents = e.target.result
        if (f.type == 'text/plain' && self.model.length == 0) {
          var newList = JSON.parse(contents)
          self.model.add(newList)
          localStorage.setItem('websitesList', JSON.stringify(self.model))
        } else {
          $('#errorTitle').text('Error with the file')
          $('#errorText').text('Please delete all sites before uploading a saved sites file and make sure the uploaded file is a backup file.')
          $('#errorModal').modal('toggle')
        }
      }
      r.readAsText(f)
      $('#fileForm').get(0).reset() // Reset the form so if a file with the same name is uploaded it stills triggers a change event
    } else {
      $('#errorTitle').text('Failed to load the file')
      $('#errorText').text('There was an error opening the file.')
      $('#errorModal').modal('toggle')
    }
  },

  render: function () {
    this.$el.html('')
    this.$el.html(this.template(this.model.toJSON()))
    // Fills the input select with the specified sections
    for (var i = 0; i < sections.length; i++) {
      $('#sections').append(`<option>${sections[i]}</option>`)
    }
  },

  emptyAddSiteForm: function () {
    $('#formAgregarURL fieldset').removeAttr('disabled')
    $('#ErrorName').text('')
    $('#name').val('')
    $('#url').val('')
    $('#errorUrl').text('')
    $('.successMsg').text('')
  },

  addHttpsText: function (e) {
    // e.currentTarget refers to the element that fired the event
    if ($(e.currentTarget).val() == '') {
      $(e.currentTarget).val('https://')
    }
  },

  saveSite: function () {
    var self = this
    var name = $('#name').val()
    var url = $('#url').val()
    var section = $('#sections').val()
    var newUrl = new URL()
    newUrl.set({
      name: name,
      url: url,
      section: section
    })
    if (newUrl.isValid()) {
      // If the new website is valid, add it to the list (self.model)
      // Once the new website has been added, empty the fields and save the changes using localStorage
      self.model.add(newUrl)
      $('#name').val('')
      $('#url').val('')
      localStorage.setItem('websitesList', JSON.stringify(list))
      $('.successMsg').text(' *Your website has been added')
    }
  }
})
var AddFormView = new AddForm()
