// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .filter('openeDate', ['dateFilter', openeDateFilterFactory])

function openeDateFilterFactory (dateFilter) {
  function openeDateFilter (dateValue, givenFormat) {
    if (dateValue === undefined || dateValue == null)
      return ''

    var format = 'dd. MMM yyyy HH:mm'
    if (givenFormat === 'fullDate')
      format = 'dd. MMM yyyy HH:mm:ss'

    return dateFilter(dateValue, format)
  }

  return openeDateFilter
}
