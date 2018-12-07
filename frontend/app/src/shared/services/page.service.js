// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .factory('pageService', pageService)

function pageService () {
  return {
    /**
     * @param pages
     * @param labelKey - key for translation
     * @param url - of page
     * @param icon - material icon name; default: 'content_copy'
     */
    addPage: function (pages, labelKey, url, icon) {
      pages.push({
        labelKey: labelKey,
        url: url,
        icon: icon || 'content_copy'
      })
    },

    /**
     * @param pages
     * @param labelKey - key for translation
     * @param sref - of page
     * @param icon - material icon name; default: 'content_copy'
     * @param isAdminOnly - if true this page can only be viewed by admins
     */
    addSystemPage: function (pages, labelKey, sref, isAdminOnly, icon) {
      pages.push({
        labelKey: labelKey,
        sref: sref,
        icon: icon || 'description',
        isAdminOnly: isAdminOnly
      })
    }
  }
}
