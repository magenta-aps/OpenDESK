angular
  .module('openDeskApp.translations', [])
  .config(['$translateProvider', config])

var availableFiles = {files: []}
var availableLanguages = {
  keys: ['en', 'da'],
  localesKeys: {
    'en_US': 'en',
    'en_UK': 'en',
    'da_DK': 'da'
  }
}

function addFile (prefix, suffix) {
  availableFiles.files.push({
    prefix: prefix,
    suffix: suffix
  })
  return this
}

function getLanguageFiles () {
  return availableFiles
}

function config ($translateProvider) {
  addFile('app/src/i18n/', '.json')
  $translateProvider.useStaticFilesLoader(getLanguageFiles())

  $translateProvider.useSanitizeValueStrategy('sanitizeParameters')

  $translateProvider
    .registerAvailableLanguageKeys(availableLanguages.keys, availableLanguages.localesKeys)
    .determinePreferredLanguage()

    // set default language if browsers langugage not found
  if (availableLanguages.keys.indexOf($translateProvider.preferredLanguage()) === -1)
    $translateProvider.preferredLanguage(availableLanguages.keys[0])
}
