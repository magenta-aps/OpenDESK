// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('ckEditor')
  .controller('ckEditorController', ['$scope', '$window', ckEditorController])

function ckEditorController ($scope, $window) {
  var vm = this

  activate()

  function activate (value) {
    vm.value = value
    $window.CKEDITOR_BASEPATH = '/opendesk/assets/libs/ckeditor/'
    // Important to load ckEditor after the basepath has been set!!
    require('ckeditor')
    $window.CKEDITOR.config.height = 400

    $window.CKEDITOR.on('instanceCreated', function (event) {
      event.editor.on('change', function () {
        vm.callback(event.editor.getData())
      })
    })
    $window.CKEDITOR.replace('ckeditor')
  }
}
