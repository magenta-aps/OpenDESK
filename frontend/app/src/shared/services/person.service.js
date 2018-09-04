angular
  .module('openDeskApp')
  .factory('personService', personService)

function personService () {
  var blankImageUrl = 'assets/img/avatars/blank-profile-picture.png'
  return {
    getAvatarUrl: getAvatarUrl,
    getAvatarUrlFromRef: getAvatarUrlFromRef
  }

  function getAvatarUrl (user) {
    if (user.avatar === undefined) {
      return blankImageUrl
    } else {
      var avatar = user.avatar.replace('/thumbnails/avatar', '')
      console.log(avatar)
      return `/alfresco/s/${avatar}`
    }
  }

  function getAvatarUrlFromRef (avatarRef) {
    if (avatarRef !== undefined) {
      var avatarId = avatarRef.split('/')[3]
      return `/alfresco/s/api/node/workspace/SpacesStore/${avatarId}/content`
    }
    return blankImageUrl
  }
}
