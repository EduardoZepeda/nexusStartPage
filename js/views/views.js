var urlView = Backbone.View.extend({
  tagName: 'div',
  className: 'url',
  model: new URL(),
  urlTemplate: $('#urlTemplate'),
  editUrlTemplate: $('#editionForm'),

  initialize: function() {
    this.editTemplate = _.template(this.editUrlTemplate.html())
    this.template = _.template(this.urlTemplate.html())
    this.model = new URL(this.model)
  },

  events: {
    'mouseenter .wrapperUrl': 'showUrlModifiyIcons',
    'mouseleave .wrapperUrl': 'hideUrlModifiyIcons',
    'dblclick .deleteUrl': 'deleteUrl',
    'click .editSite': 'renderEditForm',
    'click .closeEdit': 'closeEdit',
    'click .updateUrl': 'handleEditFormValues',
  },

  showUrlModifiyIcons: function() {
    this.$el.find('.editSite').show()
    this.$el.find('.deleteUrl').show()
  },

  hideUrlModifiyIcons: function() {
    this.$el.find('.editSite').hide()
    this.$el.find('.deleteUrl').hide()
  },

  showMessage: function(message, selector) {
    $(selector).text(message)
    setTimeout(function() {
      $(selector).text('')
    }, 2000)
  },

  returnReference: function() {
    return this.model.get('reference')
  },

  deleteThisModelFromCollection: function() {
    var that = this
    var filteredList = urlCollection
      .get(this.returnReference())
      .get('content')
      .filter(function(listItem) {
        return listItem.name != that.model.get('name')
      })
    urlCollection.get(this.returnReference()).set('content', filteredList)
  },

  deleteUrl: function() {
    this.deleteThisModelFromCollection()
    app.render()
  },

  returnUrlEditFormValues: function() {
    var newName = $('.editName').val().trim()
    var newUrl = $('.editURL').val().trim()
    var newSection = $('#availableSections').val().trim()
    if (newUrl) {
      newUrl = 'https://' + newUrl
    }
    return {
      name: newName,
      url: newUrl,
      reference: newSection
    }
  },

  validateEditFormValues: function() {
    var formValues = this.returnUrlEditFormValues()
    return formValues.name && formValues.url && formValues.reference
  },

  cleanEditForm: function() {
    var newName = $('.editName').val('')
    var newUrl = $('.editURL').val('')
    $('.editName').focus()
  },

  handleEditFormValues: function() {
    if (this.validateEditFormValues()) {
      this.updateUrl()
      this.showMessage("Url updated!", ".successMsgEditUrl")
    } else {
      this.showMessage("Fields can't be empty", ".warningMsgEditUrl")
    }
  },

  updateUrl: function() {
    var formValues = this.returnUrlEditFormValues()
    this.deleteUrl()
    urlCollection.get(formValues.reference)
      .get('content')
      .push(formValues)
    app.render()
  },

  closeEdit: function() {
    this.render()
  },

  renderSectionOptionsFromCollection: function() {
    $('#availableSections').innerHTML = ''
    urlCollection.forEach(function(section) {
      var option = document.createElement('option')
      option.setAttribute('value', section.cid)
      option.text = section.get('name')
      $('#availableSections').append(option)
    })
  },

  removeHttpsFromUrl: function() {
    var urlWithoutProtocol = this.model.get('url').replace('https://', '')
    this.model.set('url', urlWithoutProtocol)
  },

  renderEditForm: function() {
    $('.closeEdit').click() //prevents multiple edit forms
    this.removeHttpsFromUrl()
    this.$el.html(this.editTemplate(this.model.toJSON()))
    this.renderSectionOptionsFromCollection()
    return this
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()))
    return this
  }
})

var sectionView = Backbone.View.extend({
  tagName: 'div',
  className: 'section',
  model: new section(),
  sectionTemplate: $('#sectionTemplate'),
  editSectionTemplate: $('#sectionEditionForm'),
  initialize: function() {
    this.template = _.template(this.sectionTemplate.html())
    this.editSectionTemplate = _.template(this.editSectionTemplate.html())
  },
  events: {
    'mouseenter .wrapperSection': 'showSectionModifiyIcons',
    'mouseleave .wrapperSection': 'hideSectionModifiyIcons',
    'click .editSection': 'editSection',
    'dblclick .deleteSection': 'deleteSection',
    'click .closeSectionEdit': 'closeSectionEdit',
    'click .editSectionModel': 'editSectionModel'
  },

  showSectionModifiyIcons: function() {
    this.$el.find('.editSection').show()
    this.$el.find('.deleteSection').show()
  },

  hideSectionModifiyIcons: function() {
    this.$el.find('.editSection').hide()
    this.$el.find('.deleteSection').hide()
  },

  editSection: function() {
    this.$el.html(this.editSectionTemplate(this.model.toJSON()))
  },

  editSectionModel: function() {
    var newSectionName = $('#EditSectionNameForm').val().trim()
    if (newSectionName) {
      urlCollection.get(this.model.cid).set('name', newSectionName)
      app.render()
    } else {
      this.showMessage('Can\'t be empty', '.warningMsgEditSection')
    }
  },

  showMessage: function(message, selector) {
    $(selector).text(message)
    setTimeout(function() {
      $(selector).text('')
    }, 2000)
  },

  closeSectionEdit: function() {
    app.render()
  },

  deleteSection: function() {
    urlCollection.remove(this.model)
    app.render()
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()))
    return this
  }
})

var sitesView = Backbone.View.extend({
  el: $('#mainApp'),
  initialize: function() {
    this.render()
  },

  events: {
    'click .deleteAllSites': 'deleteAllSites',
    'click .createUrl': 'handleUrlForm',
    'click .addUrl': 'handleUrlModalOpen',
    'click .addSection': 'handleSectionForm',
    'click .addSectionModal': 'renderSectionListModal',
    'click .downloadSites': 'downloadSites',
    'click .uploadFile': 'uploadFile',
    'change #fileElem': 'readSingleFile'
  },

  deleteAllSites: function() {
    urlCollection.reset()
    app.render()
  },

  cleanUrlModal: function() {
    $('#name').val('')
    $('#url').val('')
    $('#name').focus()
  },

  returnUrlFormValues: function() {
    var newName = $('#name').val().trim()
    var newUrl = $('#url').val().trim()
    var newSection = $('#sections').val().trim()
    if (newUrl) {
      newUrl = 'https://' + newUrl
    }
    return {
      name: newName,
      url: newUrl,
      reference: newSection
    }
  },

  validateUrlForm: function() {
    var urlFormValues = this.returnUrlFormValues()
    return urlFormValues.name && urlFormValues.url && urlFormValues.reference
  },

  handleUrlForm: function(event) {
    if (this.validateUrlForm()) {
      this.createUrl()
      this.showMessage("Section added!", '.successMsg')
    } else {
      this.showMessage("Please fill every field", '.warningMsg')
    }
  },

  showMessage: function(message, selector) {
    $(selector).text(message)
    setTimeout(function() {
      $(selector).text('')
    }, 2000)
  },

  createUrl: function() {
    var urlFormValues = this.returnUrlFormValues()
    var newSection = urlFormValues.reference
    this.cleanUrlModal()
    var urlObject = [urlFormValues]
    var previousSiteList = urlCollection.get(newSection).get('content')
    urlObject.push.apply(urlObject, previousSiteList) //array concatenation
    urlCollection.get(newSection).set('content', urlObject)
    app.render()
  },

  handleUrlModalOpen: function(event) {
    event.stopPropagation()
    if (urlCollection.length < 1) {
      this.showMessage(' *Please add at least one section to start adding sites.', '.SectionEmptyWarning')
      $('#AddSectionModal').modal('toggle')
      this.renderSectionListModal()
    } else {
      $('#AddUrlModal').modal('toggle')
      this.renderSectionOptions()
    }
    this.cleanUrlModal()
  },

  renderSectionOptions: function() {
    $('#sections').html('')
    urlCollection.forEach(function(section) {
      var option = document.createElement('option')
      option.setAttribute('value', section.cid)
      option.text = section.get('name')
      $('#sections').append(option)
    })
  },

  renderSectionListModal: function() {
    $('#renderedSections').html('')
    urlCollection.forEach(function(section) {
      var paragraph = document.createElement('p')
      paragraph.innerText = section.get('name')
      $('#renderedSections').append(paragraph)
    })
  },

  validateSectionForm() {
    return $('#sectionName').val().trim()
  },

  handleSectionForm: function() {
    if (this.validateSectionForm()) {
      this.addSection()
      this.showMessage("Section added!", ".successMsgSection")
    } else {
      this.showMessage("A section name can't be empty", ".warningMsgSection")
      $('#sectionName').val('')
    }
  },

  addSection: function() {
    var newSectionName = $('#sectionName').val()
    urlCollection.add([{
      name: newSectionName,
      content: []
    }])
    $('#sectionName').val('')
    app.render()
    this.renderSectionListModal()
  },

  downloadSites: function() {
    if (urlCollection.length != 0) {
      var backupList = JSON.stringify(urlCollection.toJSON())
      var hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(backupList)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'sitesBackup.txt'
      hiddenElement.click()
    } else {
      var errorTitle = 'There are no sites to backup'
      var errorText = 'You can\'t create a backup of an empty list.'
      this.displayErrorModal(errorTitle, errorText)
    }
  },

  displayErrorModal: function(title, message) {
    $('#errorTitle').text(title)
    $('#errorText').text(message)
    $('#errorModal').modal('toggle')
  },

  uploadFile: function() {
    var el = document.getElementById('fileElem')
    if (el) {
      el.click()
    }
  },

  readSingleFile: function(evt) {
    var f = evt.target.files[0]
    var that = this
    if (f) {
      var r = new FileReader()
      r.onload = function(e) {
        var contents = e.target.result
        if (f.type == 'text/plain' && urlCollection.length == 0) {
          var urlCollectionBackup = JSON.parse(contents)
          urlCollection.add(urlCollectionBackup)
          localStorage.setItem('listOfSectionAndSites', JSON.stringify(urlCollection))
          app.render()
        } else {
          var errorTitle = 'Error with the file'
          var errorText = 'Please delete all sites before uploading a saved sites file and make sure the uploaded file is a backup file.'
          that.displayErrorModal(errorTitle, errorText)
        }
      }
      r.readAsText(f)
      $('#fileForm').get(0).reset() // Reset the form so if a file with the same name is uploaded it stills triggers a change event
    } else {
      var errorTitle = 'Failed to load the file'
      var errorText = 'There was an error opening the file.'
      that.displayErrorModal(errorTitle, errorText)
    }
  },

  saveSitesOnLocalStorage: function() {
    localStorage.setItem('listOfSectionAndSites', JSON.stringify(urlCollection))
  },

  render: function() {
    this.saveSitesOnLocalStorage()
    $('#renderedSites').html('')
    urlCollection.forEach(function(section) {
      if (section.get('content').length > 0) {
        var renderedSection = new sectionView({
          model: section
        })
        $('#renderedSites').append(renderedSection.render().el)
      }
      section.get('content').forEach(function(site) {
        site.reference = section.cid //Add a reference to its section
        var renderedUrl = new urlView({
          model: site,
        })
        renderedSection.el.append(renderedUrl.render().el)
      })
    })
    return this
  }
})

var app = new sitesView()
