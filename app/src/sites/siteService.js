'use strict';

angular.module('openDeskApp.sites').factory('siteService', function ($http, $window) {
    var restBaseUrl = '/alfresco/s/api/';

    return {
        getSiteMembers: function (siteShortName) {
            return $http.get( '/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            })
        },
        getSites: function () {
            return $http.get( '/api/sites').then(function (response) {
                return response.data;
            })
        },
        getSitesByQuery: function (query) {
            return $http.get( '/api/sites?nf=' + query ).then(function (response) {
                return response.data;
            })
        },
        createSite: function (siteName, siteDescription) {
            return $http.post( '/api/sites', {shortName: siteName, sitePreset : "default", title : siteName, description : siteDescription}).then(function (response) {
                return response.data;
            })
        },
        addMemberToSite: function (siteName, member, role) {
            return $http.post( '/api/sites/' + siteName + '/memberships', {role: role, person : {userName : member} }).then(function (response) {
                return response.data;
            })
        },
        removeMemberFromSite: function (siteName, member) {
            return $http.delete( '/api/sites/' + siteName + '/memberships/' + member).then(function (response) {
                return response.data;
            })
        },
        updateRoleOnSiteMember: function (siteName, member, newRole) {
            return $http.put( '/api/sites/' + siteName + '/memberships', {role: newRole, person : {userName : member}}).then(function (response) {
                return response.data;
            })
        },
        getSiteRoles: function (siteName) {
            return $http.get('/api/sites/' + siteName + "/roles").then(function (response) {
                return response.data;
            })
        },
        deleteSite: function (siteName) {
            return $http.delete( '/api/sites/'+ siteName).then(function (response) {
                return response.data;
            })
        }

    };
});