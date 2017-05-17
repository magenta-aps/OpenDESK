'use strict';

angular.module('openDeskApp').factory('nodeRefUtilsService', function () {

    return {
        getId : function(nodeRef) {
            return nodeRef.split('/')[3];
        }
    };
});


