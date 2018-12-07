// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .filter('isContained', isContainedFilter)

function isContainedFilter () {
  return function (items, values) {
    var arrayToReturn = []

    if (values === undefined || values === '')
      return items

    var userNames = []
    for (var i = 0; i < values.length; i++)
      userNames.push(values[i].userName)

    for (var j = 0; j < items.length; j++)
      if (containsAll(items[j].members, userNames))
        arrayToReturn.push(items[j])

    return arrayToReturn
  }
}

function containsAll (haystack, needles) {
  for (var i = 0, len = needles.length; i < len; i++)
    if ($.inArray(needles[i], haystack) === -1) return false

  return true
}
