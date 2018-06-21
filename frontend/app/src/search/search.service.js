'use strict'

angular
  .module('openDeskApp.search')
  .factory('searchService', searchService)

function searchService ($http) {
  var repoQuery = {
    maxResults: 0,
    pageSize: 25,
    spellcheck: true
  }
  var termQuery = 'PATH:"/app:company_home/st:sites/*/cm:documentLibrary//*" TYPE:"cm:content"'

  return {
    documentSearch: documentSearch,
    documentLiveSearch: documentLiveSearch,
    getConfiguredFacets: getConfiguredFacets
  }

  function documentSearch (customQuery) {
    var query = angular.copy(repoQuery)
    for (var attrName in customQuery) query[attrName] = customQuery[attrName]
    return searchByQuery(query)
  }

  function documentLiveSearch (term) {
    var query = angular.copy(repoQuery)
    query.maxResults = 5
    query.term = term
    return searchByQuery(query)
  }

  function searchByQuery (query) {
    query.term = termQuery + '*' + query.term + '*'
    var queryString = objectToQueryString(query)

    return $http.get('/slingshot/search?' + queryString).then(function (response) {
      return response.data
    })
  }

  /**
    * @param map
    * @returns {string}
    */
  function objectToQueryString (map) {
    // FIXME: need to implement encodeAscii!!
    var enc = encodeURIComponent
    var pairs = []
    for (var name in map) {
      var value = map[name]
      var assign = enc(name) + '='
      if (Array.isArray(value))
        for (var i = 0, l = value.length; i < l; ++i)
          pairs.push(assign + enc(value[i]))

      else
        pairs.push(assign + enc(value))
    }
    return pairs.join('&') // String
  }

  /**
     * This returns the list of facets configured in the repository for use with the returned results
     */
  function getConfiguredFacets () {
    return $http.get('/api/facet/facet-config').then(function (response) {
      var rawFacets = response.data.facets
      var facets = []
      rawFacets.forEach(function (facet) {
        if (facet.isEnabled)
          facets.push(facet)
      })

      return facets
    })
  }
}
