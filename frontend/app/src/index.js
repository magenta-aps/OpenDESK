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

// Modules
import './app.module'
import './init.module'
import './backendConfig.module'
import './translations'
import './authentication'
import './header'
import './dashboard'
import './system_settings'
import './notifications'
import './user'
import './appDrawer'
import './filebrowser'
import './odSite'
import './group'
import './lool'
import './documents'
import './onlyOffice'
import './odDocuments'
import './odDiscussion'
import './search'
import './searchBar'
// import './odChat' Not added because it has not been maintained and converse is not managed by npm

// Components
import './components/members'
import './components/odEmail'

// Shared Services
import './shared/services/browser.service'
import './shared/services/member.service'

window.$ = $

function importAll (r) {
  r.keys().forEach(r)
}

importAll(
  require.context('./', true, /.*\.scss$/)
)

angular.element(document).ready(function () {
  angular.bootstrap(document, ['openDeskApp'])
})
