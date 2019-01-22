// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp.translations', [])
  .config(['$translateProvider', config])

var availableFiles = {files: [
  {
    prefix: 'assets/i18n/',
    suffix: '.json'
  }
]}
var availableLanguages = {
  keys: ['en', 'da'],
  localesKeys: {
    'en_US': 'en',
    'en_UK': 'en',
    'da_DK': 'da'
  }
}

function config ($translateProvider) {
  $translateProvider.useStaticFilesLoader(availableFiles)

  $translateProvider.useSanitizeValueStrategy('sanitizeParameters')

  $translateProvider
    .registerAvailableLanguageKeys(availableLanguages.keys, availableLanguages.localesKeys)
    .determinePreferredLanguage()

    // set default language if browsers langugage not found
  if (availableLanguages.keys.indexOf($translateProvider.preferredLanguage()) === -1)
    $translateProvider.preferredLanguage(availableLanguages.keys[0])
}
