//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
import '../shared/services/alfrescoNode.service'

angular.module('openDeskApp.site')
  .factory('siteService', ['$q', '$http', '$rootScope', 'alfrescoNodeService', 'sessionService',
    'systemSettingsService', SiteService])

function SiteService ($q, $http, $rootScope, alfrescoNodeService, sessionService, systemSettingsService) {
  var site = {}
  var userManagedProjects = []
  var currentPermissions

  var editRole = 'Collaborator'
  var managerRole = 'Manager'
  var outsiderRole = 'Outsider'
  var ownerRole = 'Owner'
  var adminPermissions = {
    isManager: true,
    isMember: true,
    canEdit: true,
    userRole: managerRole
  }

  var service = {
    addMember: addMember,
    createPDSite: createPDSite,
    createSite: createSite,
    getSite: getSite,
    getTemplateNames: getTemplateNames,
    findSites: findSites,
    getSites: getSites,
    loadSiteData: loadSiteData,
    updatePDSite: updatePDSite,
    updateSite: updateSite,
    delete: deleteSite,
    createProjectLink: createProjectLink,
    deleteLink: deleteLink,
    createMembersPDF: createMembersPDF,
    getSiteGroups: getSiteGroups,
    createTemplate: createTemplate,
    getNode: getNode,
    getSiteUserPermissions: getSiteUserPermissions,
    getPermissions: getPermissions,
    setUserManagedProjects: setUserManagedProjects,
    getUserManagedProjects: getUserManagedProjects,
    getAuthorities: getAuthorities,
    getUsers: getUsers,
    updateMemberList: updateMemberList,
    addFavourite: addFavourite,
    removeFavourite: removeFavourite,
    removeMember: removeMember,
    findAuthorities: findAuthorities
  }

  return service

  function addMember (siteShortName, authority, group) {
    return $http.post(`/alfresco/service/site/${siteShortName}/group/${group}/member/${authority}`)
      .then(function (response) {
        return response.data
      })
  }

  function getSite () {
    return site
  }

  function updateMemberList () {
    $rootScope.$broadcast('updateMemberList')
  }

  function getTemplateNames () {
    return systemSettingsService.getTemplates().then(function (response) {
      var templates = []

      angular.forEach(response, function (template) {
        templates.push({
          'shortName': template.shortName,
          'displayName': template.title
        })
      })

      return templates
    })
  }

  function findSites () {
    return $http.get('/alfresco/service/sites/search')
      .then(
        function (response) {
          return response.data
        },
        function (error) {
          console.log('Error retrieving list of all sites.')
          console.log(error)
        }
      )
  }

  function getSites () {
    return $http.get('/alfresco/service/sites')
      .then(
        function (response) {
          return response.data
        },
        function (err) {
          console.log(err)
        }
      )
  }

  function createSite (displayName, description, visibility) {
    var payLoad = {
      displayName: displayName,
      description: description,
      visibility: visibility
    }
    return $http.post('/alfresco/service/site', payLoad)
      .then(
        function (response) {
          return response.data
        },
        function (error) {
          if (error.data.status.code === '400' && error.data.message === 'error.duplicateShortName') return null
        }
      )
  }

  function updateSite (site) {
    return $http.put('/api/sites/' + site.shortName, {
      shortName: site.shortName,
      sitePreset: 'default',
      title: site.title,
      description: site.description,
      visibility: site.visibility
    }).then(function (response) {
      var isInherited = response.data.isPublic
      getNode(site.shortName, 'documentLibrary', '').then(function (response) {
        var nodeId = response.parent.nodeRef.split('/')[3]
        var data = {
          'isInherited': isInherited,
          'permissions': []
        }
        return $http.post('/alfresco/s/slingshot/doclib/permissions/workspace/SpacesStore/' + nodeId, data)
          .then(function (response) {
            return response
          })
      })
    })
  }

  function loadSiteData (siteShortName) {
    return $http.get(`/alfresco/service/site/${siteShortName}`)
      .then(function (response) {
        site = response.data
        return site
      })
  }

  function createPDSite (newSite) {
    var payLoad = {
      title: newSite.siteName,
      description: newSite.description,
      sbsys: newSite.sbsys,
      owner: newSite.owner.userName,
      manager: newSite.manager.userName,
      visibility: newSite.visibility,
      centerId: newSite.center_id,
      templateName: newSite.template.name
    }
    return $http.post('/alfresco/service/pd-site', payLoad)
      .then(function (response) {
        return response
      })
  }

  function updatePDSite (site) {
    var payLoad = {
      title: site.title,
      description: site.description,
      sbsys: site.sbsys,
      owner: site.owner.userName,
      manager: site.manager.userName,
      visibility: site.visibility,
      centerId: site.center_id,
      state: site.state
    }
    return $http.put(`/alfresco/service/pd-site/${site.shortName}`, payLoad)
      .then(function (response) {
        return response
      })
  }

  function deleteSite (siteShortName) {
    return $http.delete(`/alfresco/service/site/${siteShortName}`)
      .then(function (response) {
        return response.data
      })
  }

  function createProjectLink (destinationShortName) {
    var payLoad = {
      destinationShortName: destinationShortName
    }
    return $http.post(`/alfresco/service/site/${site.shortName}/siteLink`, payLoad)
      .then(function (response) {
        return response.data
      })
  }

  function deleteLink (destinationShortName) {
    return $http.delete(`/alfresco/service/site/${site.shortName}/siteLink/${destinationShortName}`)
      .then(function (response) {
        return response.data
      })
  }

  function createMembersPDF (siteShortName) {
    return $http.post(`/alfresco/service/site/${siteShortName}/members-pdf`)
      .then(function (response) {
        return response.data
      })
  }

  function getSiteGroups (siteType) {
    return $http.get(`/alfresco/service/site/groups/${siteType}`)
      .then(function (response) {
        angular.forEach(response.data, function (group) {
          group.members = []
          if (group.collapsed) group.open = false
        })

        return response.data
      })
  }

  function createTemplate (siteShortName, description) {
    var payLoad = {
      description: description
    }
    return $http.post(`/alfresco/service/site/${siteShortName}/template`, payLoad)
      .then(function (response) {
        return response.data
      })
  }

  function getNode (siteName, container, path) {
    return $http.get('/slingshot/doclib/treenode/site/' + siteName + '/' + container + '/' + path)
      .then(function (response) {
        return response.data
      })
  }

  function getSiteUserPermissions (siteShortName) {
    if (sessionService.isAdmin()) {
      currentPermissions = adminPermissions
      return $q.resolve(adminPermissions)
    }

    var permissions = {}
    return $http.get(`/alfresco/service/site/${siteShortName}/role`)
      .then(
        function (response) {
          var userRole
          if (response.data.role === undefined)
            userRole = outsiderRole
          else
            userRole = response.data.role

          permissions.userRole = userRole
          permissions.isManager = userRole === managerRole
          switch (userRole) {
            case editRole:
            case ownerRole:
            case managerRole:
              permissions.canEdit = true
              break
            default:
              permissions.canEdit = false
              break
          }
          permissions.isMember = userRole !== outsiderRole
          currentPermissions = permissions
          return permissions
        }
      )
  }

  function getPermissions () {
    return currentPermissions
  }

  function setUserManagedProjects () {
    getSites().then(function (response) {
      var projects = []
      for (var i in response)
        if (response[i].shortName !== site.shortName && response[i].current_user_role === managerRole)
          projects.push(response[i])

      userManagedProjects = projects
    })
  }

  function getUserManagedProjects () {
    return userManagedProjects
  }

  function getAuthorities (siteShortName) {
    return $http.get(`/alfresco/service/site/${siteShortName}/authorities`)
      .then(function (response) {
        return response.data
      })
  }

  function getUsers (siteShortName) {
    return $http.get(`/alfresco/service/site/${siteShortName}/users`)
      .then(function (response) {
        return response.data
      })
  }

  function addFavourite (nodeId) {
    return $http.post('/alfresco/api/-default-/public/alfresco/versions/1/people/-me-/favorites', {
      target: {
        site: {
          guid: nodeId
        }
      }
    }).then(function (response) {
      return response
    })
  }

  function removeFavourite (nodeId) {
    return $http.delete(`/alfresco/api/-default-/public/alfresco/versions/1/people/-me-/favorites/${nodeId}`)
      .then(function (response) {
        return response
      })
  }

  function removeMember (siteShortName, authority, group) {
    return $http.delete(`/alfresco/service/site/${siteShortName}/group/${group}/member/${authority}`)
      .then(function (response) {
        return response.data
      })
  }

  function findAuthorities (siteShortName, filter) {
    var data = {
      params: { filter: encodeURIComponent(filter) }
    }
    return $http.get(`/alfresco/service/site/${siteShortName}/authorities/search`, data)
      .then(function (response) {
        return response.data
      })
  }
}
