// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .filter('exactMatch', exactMatchFilter)

function exactMatchFilter () {
  return function (items, params, values) {
    var arrayToReturn = []

    for (var i = 0; i < params.length; i++) {
      if (values[i] === undefined || values[i] === '')
        continue

      for (var j = 0; j < items.length; j++)
        if (items[j][params[i]] === values[i])
          arrayToReturn.push(items[j])
    }

    if (arrayToReturn.length === 0)
      return items

    return arrayToReturn
  }
}
