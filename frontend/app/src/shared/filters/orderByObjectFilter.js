// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .filter('orderObjectBy', orderObjectBy)

function orderObjectBy () {
  return function (items, field, reverse) {
    function index (obj, i) {
      // Variables can be undefined. In that case fill with empty string.
      if (obj === undefined)
        return ''
      return obj[i]
    }

    if (field) {
      var filtered = []
      angular.forEach(items, function (item) {
        filtered.push(item)
      })

      filtered.sort(function (a, b) {
        var comparator, reducedA, reducedB
        if (field) {
          reducedA = field.split('.').reduce(index, a)
          reducedB = field.split('.').reduce(index, b)
          reducedA = reducedA == null ? '' : reducedA.toString().toLowerCase()
          reducedB = reducedB == null ? '' : reducedB.toString().toLowerCase()
          if (reducedA === reducedB)
            comparator = 0
          else
            comparator = (reducedA > reducedB ? 1 : -1)
        }
        return comparator
      })
      if (reverse) filtered.reverse()
      return filtered
    } else {
      return items
    }
  }
}
