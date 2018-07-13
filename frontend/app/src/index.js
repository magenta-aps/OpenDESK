import $ from 'jquery'
import 'angular'
import 'angular-auto-height'
import 'angular-cookies'
import 'angular-drag-and-drop-lists'
import 'angular-img-fallback'
import 'angular-material'
import 'angular-messages'
import 'angular-resource'
import 'angular-sanitize'
import 'angular-swfobject'
import 'angular-translate'
import 'angular-translate-loader-static-files'
import 'angular-ui-router'
import 'ckeditor'
import 'isteven-angular-multiselect/isteven-multi-select'
import 'ng-ckeditor'

import 'angular-material/angular-material.css'
import 'angular-material-data-table/dist/md-data-table.min.css'
import 'isteven-angular-multiselect/isteven-multi-select.css'

window.$ = $

function importAll (r) {
  r.keys().forEach(r)
}

importAll(
  require.context('./', true, /^(.*\.module\.js$)/)
)

importAll(
  // including subdirectories, find all *.js files except those matching *.module.js or *.spec.js
  // require.context('./', true, /^(?!.*\.module\.js$)^(?!.*\.spec\.js$).*\.js$/)
  require.context('./', true, /^(?!.*\.module\.js$).*\.js$/)
)

require('./app.scss')

importAll(
  require.context('./', true, /.*\.scss$/)
)

angular.element(document).ready(function () {
  angular.bootstrap(document, ['openDeskApp'])
})
