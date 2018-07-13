import $ from 'jquery'
import 'angular'
import 'angular-sanitize'
import 'angular-messages'
import 'angular-material'
import 'angular-cookies'
import 'angular-ui-router'
import 'angular-resource'
import 'angular-translate'
import 'angular-translate-loader-static-files'
import 'isteven-angular-multiselect/isteven-multi-select'
import 'angular-auto-height'
import 'angular-swfobject'
import 'angular-drag-and-drop-lists'
import 'angular-img-fallback'

import 'angular-material/angular-material.css'
import 'isteven-angular-multiselect/isteven-multi-select.css'
import 'angular-material-data-table/dist/md-data-table.min.css'

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
