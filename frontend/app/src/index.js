import $ from 'jquery'
import 'angular-material/angular-material.css'
import 'isteven-angular-multiselect/isteven-multi-select.css'
import 'angular-material-data-table/dist/md-data-table.min.css'
import 'pdfjs-dist'

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

console.log('index.js')
angular.element(document).ready(function () {
  angular.bootstrap(document, ['openDeskApp'])
})
