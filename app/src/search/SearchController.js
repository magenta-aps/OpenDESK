angular
    .module('openDeskApp')
    .controller('SearchController', SearchController)
    .directive('odSearchbar', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/search/view/searchbar.html',
            controller: 'SearchController'
        };
    })
    .filter('count', function() {
        return function (collection, key) {
            return out;
        }
    });

function SearchController($scope, $state, $interval, $translate, $stateParams, searchService, fileUtilsService,
                          documentService, userService) {

    $scope.searchTerm = $stateParams.searchTerm;
    $scope.selectedFilters = {}; //Keep track of the selected filters
    $scope.filtersQueryString=""; // the selected filters as query string
    $scope.definedFacets = searchService.getConfiguredFacets();
    $scope.layout = 'grid';
    $scope.showFilters = false;

    function addThumbnailUrl(files) {
        files.forEach(function (item) {
            item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimetype, 24);
        });
    };

    $scope.count = function (prop, value) {
        return function (el) {
            return el[prop] == value;
        };
    };

    $scope.toggleFilters = function() {
		$scope.showFilters = !$scope.showFilters;
		$interval(function(){}, 1,1000);
	}

    function initFacets(){
        searchService.getConfiguredFacets().then(function(data){
            $scope.definedFacets = data;
            executeSearch();
        });
    }
    initFacets();

    /**
     * Executes the main search function to search for cases and case documents in the repository
     * @param term
     */
    function executeSearch() {

        $scope.isLoading = true;

        var queryObj = {
            facetFields: parseFacetsForQueryFilter(),
            filters: $scope.filtersQueryString, //"{http://www.alfresco.org/model/content/1.0}creator|abeecher"
            maxResults: 0,
            noCache: new Date().getTime(),
            pageSize: 25,
            query: "",
            repo: true,
            rootNode: "", // openesdh://cases/home
            site: "",
            sort: "",
            spellcheck: true,
            startIndex: 0,
            tag: "",
            term: $scope.searchTerm+'*'
        };
        var objQuerified = objectToQueryString(queryObj);
        getSearchQuery(objQuerified);
    }

    function getSearchQuery(query){

        searchService.search(query).then(function(response){
            $scope.queryResult = response;
            $scope.search = {};

            $scope.facets = [];

            var fileType = {array: [], shortname: "fileType", title: $translate.instant('COMMON.FILETYPE')};
            var modifiedBy = {array: [], shortname: "modifiedBy", title: $translate.instant('COMMON.MODIFIED_BY')};
            var site = {array: [], shortname: "site", title: $translate.instant('PROJECT.PROJECTNAME')};

            if (response.numberFound > 0) {
                var displayedItems = [];

                for (var i = 0, len = response.items.length; i < len; i++) {

                    var value = response.items[i];

                    // Break if the result is not a document
                    if (value.type != 'document')
                        continue;

                    // Break if the document is not belonging to a site
                    if (value.site == undefined)
                        continue;

                    // Get file type
                    value.fileType = fileUtilsService.getFiletypeByMimetype(value.mimetype);
                    if (fileType.array.indexOf(value.fileType) == -1)
                        fileType.array.push(value.fileType);

                    // Get last modified by
                    if (modifiedBy.array.indexOf(value.modifiedBy) == -1)
                        modifiedBy.array.push(value.modifiedBy);

                    // Get site title
                    if (site.array.indexOf(value.site.title) == -1)
                        site.array.push(value.site.title);
                    value.site = value.site.title;

                    displayedItems.push(value);
                }

                addThumbnailUrl(displayedItems);

                $scope.fullSearchResults = {
                    results: displayedItems
                };
                setActiveFacets();

                $scope.contentLength = displayedItems.length;
            }
            else
                $scope.contentLength = 0;

            $scope.facets.push(fileType);
            $scope.facets.push(modifiedBy);
            $scope.facets.push(site);
            $scope.isLoading = false;
        });
    }

    function setActiveFacets() {
        // If object is empty
        if(Object.getOwnPropertyNames($scope.selectedFilters).length == 0) return;

        angular.forEach($scope.selectedFilters, function (value, key) {
            var facet = $scope.fullSearchResults.facets[key];
            angular.forEach(facet, function (facetObject) {
                if(facetObject.value === value) facetObject.selected = true;
            })
        })
    }

    /**
     * summary:
     *		takes a name/value mapping object and returns a string representing
     *		a URL-encoded version of that object.
     * example:
     *		this object:
     *	{
         *		blah: "blah",
         *		multi: [
         *			"thud",
         *			"thonk"
         *	    ]
         *	};
     *
     *	yields the following query string: "blah=blah&multi=thud&multi=thonk"
     *
     * credit to alfresco Aikau developers.
     * @param map
     * @returns {string}
     */
    function objectToQueryString(map) {
        // FIXME: need to implement encodeAscii!!
        var enc = encodeURIComponent, pairs = [];
        for (var name in map) {
            var value = map[name];
            var assign = enc(name) + "=";
            if (Array.isArray(value)) {
                for (var i = 0, l = value.length; i < l; ++i) {
                    pairs.push(assign + enc(value[i]));
                }
            } else {
                pairs.push(assign + enc(value));
            }
        }
        return pairs.join("&"); // String
    }

    /**
     * Extracts the QName from each defined facet and 'stringifies' them for the query object
     * @returns {string}
     */
    function parseFacetsForQueryFilter() {
        var stringFacet = "";
        $scope.definedFacets.forEach(function (item) {
            stringFacet == "" ? stringFacet += item.facetQName : stringFacet = stringFacet + ',' + item.facetQName;
        });
        return stringFacet;
    }

    $scope.filterResults = function(filterKey, filterValue) {
        //console.log("The filter value : "+ filterKey +" ==> "+filterValue);
        //selectedFilters is to be used to track what is checked then on every addition or removal, we rebuild the
        //filter query string and re-execute the search
        if($scope.selectedFilters[filterKey])
            delete ($scope.selectedFilters[filterKey]);
        else
            $scope.selectedFilters[filterKey] = filterValue;

        rebuildFilterQueryString();
    };

    function rebuildFilterQueryString(){
        //console.log("Rebuilding filter Query string");
        var filterQueryStringArr  = [];
        Object.keys($scope.selectedFilters).forEach(function(key){
            var bufStr = "";
            var value = $scope.selectedFilters[key];
            //strip the @ at the start of the string just in case
            if(key.startsWith("@"))
                bufStr = key.substring(1)+"|"+value;
            else
                bufStr = key+"|"+value;

            filterQueryStringArr.push(bufStr);
        });

        $scope.filtersQueryString = filterQueryStringArr.toString();
        executeSearch();
    }


    $scope.getSearchresults = function getSearchReslts(term) {
        if(term != "")
            $state.go('search', {'searchTerm': term});
    };


    $scope.getAutoSuggestions = function getAutoSuggestions(term) {
        return searchService.getSearchSuggestions(term).then(function (val) {

            if (val != undefined) {
                val.forEach(function(item) {
                    item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimetype, 24);
                });
                return val;
            } else {
                return [];
            }
        });
    };


    $scope.gotoPath = function (ref) {
        documentService.getPath(ref.split("/")[3]).then(function (val) {
            $scope.selectedDocumentPath = val.container;
            var id = ref.replace("workspace://SpacesStore/", "");
            $state.go('document', { doc: id });
        });
    };

    $scope.searchPeople = function (query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

}