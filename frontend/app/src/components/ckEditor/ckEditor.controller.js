'use strict'
import CKEditor from '@ckeditor/ckeditor5-build-classic'

angular
  .module('ckEditor')
  .controller('ckEditorController', ['$scope', ckEditorController])

function ckEditorController ($scope) {
  var isLoaded = false

  function init (value) {
    CKEditor.create(document.getElementById('ckeditor'))
      .then(editor => {
        // Set data
        editor.setData(value)
        // Send data back to parent
        editor.model.document.on('change:data', () => {
          $scope.$ctrl.callback(editor.getData())
        })
        isLoaded = true
      })
      .catch(error => {
        console.error(error.stack)
      })
  }

  this.$onChanges = function (changes) {
    if (isLoaded)
      return
    if (changes.value.currentValue === undefined)
      return
    init(changes.value.currentValue)
  }
}
