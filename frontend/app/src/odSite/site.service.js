'use strict'
import '../shared/services/alfrescoNode.service'

angular.module('openDeskApp.site')
  .factory('siteService', ['$q', '$http', '$rootScope', '$translate', 'alfrescoNodeService', 'sessionService',
    'UserService', 'systemSettingsService', SiteService])

function SiteService ($q, $http, $rootScope, $translate, alfrescoNodeService, sessionService, UserService,
  systemSettingsService) {
  var site = {}
  var groups = {}
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
    createPDSite: createPDSite,
    createSite: createSite,
    getAllOrganizationalCenters: getAllOrganizationalCenters,
    getAllOwners: getAllOwners,
    getSite: getSite,
    getTemplateNames: getTemplateNames,
    getSites: getSites,
    getSitesPerUser: getSitesPerUser,
    loadSiteData: loadSiteData,
    updatePDSite: updatePDSite,
    updateSite: updateSite,
    delete: deleteSite,
    updateNode: updateNode,
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
    getGroupsAndMembers: getGroupsAndMembers,
    getSiteOwner: getSiteOwner,
    getSiteManager: getSiteManager,
    updateMemberList: updateMemberList,
    addFavourite: addFavourite,
    removeFavourite: removeFavourite
  }

  return service

  function getSite () {
    return site
  }

  function updateMemberList () {
    $rootScope.$broadcast('updateMemberList')
  }

  function getAllOwners () {
    return $http.post('/alfresco/service/groups', {
      PARAM_METHOD: 'getGroupMembers',
      PARAM_GROUP_NAME: 'OPENDESK_ProjectOwners'
    }).then(function (response) {
      return response.data
    },
    function (error) {
      return error
    })
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

  function getAllOrganizationalCenters () {
    return $http.get('/api/groups/OPENDESK_OrganizationalCenters/children?maxItems=500')
      .then(function (response) {
        if (response.status && response.status !== 200)
          return $q.reject(response)

        return response.data
      }, function (error) {
        console.log('Error retrieving list of all organizational centers.')
        console.log(error)
      })
  }

  function getSites () {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'getAll'
    }).then(
      function (response) {
        return response.data
      },
      function (error) {
        console.log('Error retrieving list of all sites.')
        console.log(error)
      }
    )
  }

  function getSitesPerUser () {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'getSitesPerUser'
    }).then(
      function (response) {
        return response.data
      },
      function (err) {
        console.log(err)
      }
    )
  }

  function createSite (siteName, siteDescription, siteVisibility) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'createSite',
      PARAM_SITE_DISPLAY_NAME: siteName,
      PARAM_DESCRIPTION: siteDescription,
      PARAM_VISIBILITY: siteVisibility
    }).then(
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

  function loadSiteData (shortName) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'getSite',
      PARAM_SITE_SHORT_NAME: shortName
    }).then(function (response) {
      site = response.data[0]
      return site
    })
  }

  function createPDSite (newSite) {
    return $http.post('/alfresco/service/projectdepartment', {
      PARAM_NAME: newSite.siteName,
      PARAM_DESCRIPTION: newSite.description,
      PARAM_SBSYS: newSite.sbsys,
      PARAM_OWNER: newSite.owner.userName,
      PARAM_MANAGER: newSite.manager.userName,
      PARAM_VISIBILITY: newSite.visibility,
      PARAM_CENTERID: newSite.center_id,
      PARAM_METHOD: 'createPDSITE',
      PARAM_TEMPLATE: newSite.template.name
    }).then(function (response) {
      return response
    })
  }

  function updatePDSite (site) {
    return $http.post('/alfresco/service/projectdepartment', {
      PARAM_NAME: site.title,
      PARAM_SITE_SHORT_NAME: site.shortName,
      PARAM_DESCRIPTION: site.description,
      PARAM_SBSYS: site.sbsys,
      PARAM_OWNER: site.owner.userName,
      PARAM_MANAGER: site.manager.userName,
      PARAM_CENTERID: site.center_id,
      PARAM_VISIBILITY: site.visibility,
      PARAM_STATE: site.state,
      PARAM_METHOD: 'updatePDSITE'
    }).then(function (response) {
      return response
    })
  }

  function deleteSite (siteName) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'deleteSite',
      PARAM_SITE_SHORT_NAME: siteName
    }).then(function (response) {
      return response.data
    })
  }

  /**
     * @todo this is only used for renaming in filebrowser.controller/rename.controller, and something in text_templates.controller. Perhaps it should be moved
     * @param {*} nodeRef
     * @param {*} props
     */
  function updateNode (nodeRef, props) {
    return $http.post('/api/node/' + alfrescoNodeService.processNodeRef(nodeRef).uri + '/formprocessor', props).then(function (response) {
      return response.data
    })
  }

  /**
     * @todo move this into a sitelink service
     * @param {@} destination
     */
  function createProjectLink (destination) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'addLink',
      PARAM_SOURCE: site.shortName,
      PARAM_DESTINATION: destination
    }).then(function (response) {
      // console.log(response.data)
      return response.data
    })
  }

  /**
     * @todo move this into a sitelink service
     * @param {*} source
     * @param {*} destination
     */
  function deleteLink (source, destination) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'deleteLink',
      PARAM_SOURCE: source,
      PARAM_DESTINATION: destination
    }).then(function (response) {
      return response.data
    })
  }

  function createMembersPDF (shortName) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'createMembersPDF',
      PARAM_SITE_SHORT_NAME: shortName
    }).then(function (response) {
      return response.data
    })
  }

  function getSiteGroups (siteType) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'getSiteGroups',
      PARAM_SITE_TYPE: siteType
    }).then(function (response) {
      angular.forEach(response.data, function (group) {
        group.members = []
        if (group.collapsed) group.open = false
      })

      return response.data
    })
  }

  function createTemplate (shortName, description) {
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'createTemplate',
      PARAM_SITE_SHORT_NAME: shortName,
      PARAM_DESCRIPTION: description
    }).then(function (response) {
      return response.data
    })
  }

  function getNode (siteName, container, path) {
    return $http.get('/slingshot/doclib/treenode/site/' + siteName + '/' + container + '/' + path).then(function (response) {
      return response.data
    })
  }

  function getSiteUserPermissions (siteShortName) {
    if (sessionService.isAdmin()) {
      currentPermissions = adminPermissions
      return $q.resolve(adminPermissions)
    }

    var permissions = {}
    return $http.post('/alfresco/service/sites', {
      PARAM_METHOD: 'getCurrentUserSiteRole',
      PARAM_SITE_SHORT_NAME: siteShortName
    }).then(
      function (response) {
        var userRole
        if (response.data[0].role === undefined)
          userRole = outsiderRole
        else
          userRole = response.data[0].role

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
    getSitesPerUser().then(function (response) {
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

  function getGroupsAndMembers (siteShortName) {
    return $http.post('/alfresco/service/groups', {
      PARAM_METHOD: 'getGroupsAndMembers',
      PARAM_SITE_SHORT_NAME: siteShortName,
      PARAM_GROUP_TYPE: 'USER'
    }).then(function (response) {
      groups = response.data
      groups.forEach(function (group) {
        group[1].forEach(function (member) {
          member.avatar = sessionService.makeAvatarUrl(member)
        })
      })
      return groups
    })
  }

  function getSiteOwner () {
    return getSiteGroup('PD_PROJECTOWNER')
  }

  function getSiteManager () {
    return getSiteGroup('PD_PROJECTMANAGER')
  }

  function getSiteGroup (shortName) {
    return getGroupsAndMembers().then(function (groups) {
      var members = {}

      angular.forEach(groups, function (group) {
        if (group[0].shortName === shortName)
          members = group[1][0]
      })

      return members
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
}
