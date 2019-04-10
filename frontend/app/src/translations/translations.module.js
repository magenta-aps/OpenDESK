//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

import daTranslation from './i18n/da.json'
import enTranslation from './i18n/en.json'

angular
  .module('openDeskApp.translations', [])
  .config(['$translateProvider', 'translatePluggableLoaderProvider', config])

var availableLanguages = {
  keys: ['en', 'da'],
  localesKeys: {
    'en_US': 'en',
    'en_GB': 'en',
    'da_DK': 'da'
  }
}

function config ($translateProvider, translatePluggableLoaderProvider) {
  $translateProvider.useLoader('translatePluggableLoader')
  translatePluggableLoaderProvider.translations('da', daTranslation)
  translatePluggableLoaderProvider.translations('en', enTranslation)

  $translateProvider.useSanitizeValueStrategy('sanitizeParameters')

  $translateProvider
    .registerAvailableLanguageKeys(availableLanguages.keys, availableLanguages.localesKeys)
    .determinePreferredLanguage()

  // set default language if browsers language not found
  if (availableLanguages.keys.indexOf($translateProvider.preferredLanguage()) === -1)
    $translateProvider.preferredLanguage(availableLanguages.keys[0])
}
