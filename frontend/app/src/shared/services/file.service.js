angular
  .module('openDeskApp')
  .factory('fileService', fileService)

function fileService () {
  var mimeTypesToFileTypes = {
    'text/css': 'css',
    'application/vnd.ms-excel': 'xls',
    'image/tiff': 'tiff',
    'audio/x-aiff': 'aiff',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/illustrator': 'ai',
    'image/gif': 'gif',
    'audio/mpeg': 'mp3',
    'message/rfc822': 'eml',
    'application/vnd.oasis.opendocument.graphics': 'odg',
    'application/x-indesign': 'indd',
    'application/rtf': 'rtf',
    'audio/x-wav': 'wav',
    'application/x-fla': 'fla',
    'video/x-ms-wmv': 'wmv',
    'application/msword': 'doc',
    'video/x-msvideo': 'avi',
    'video/mpeg2': 'mpeg2',
    'video/x-flv': 'flv',
    'application/x-shockwave-flash': 'swf',
    'audio/vnd.adobe.soundbooth': 'asnd',
    'image/svg+xml': 'svg',
    'application/vnd.apple.pages': 'pages',
    'text/plain': 'txt',
    'video/quicktime': 'mov',
    'image/bmp': 'bmp',
    'video/x-m4v': 'm4v',
    'application/pdf': 'pdf',
    'application/vnd.adobe.aftereffects.project': 'aep',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/xml': 'xml',
    'application/zip': 'zip',
    'video/webm': 'webm',
    'image/png': 'png',
    'text/html': 'html',
    'image/vnd.adobe.photoshop': 'psd',
    'video/ogg': 'ogv',
    'image/jpeg': 'jpg',
    'application/x-zip': 'fxp',
    'video/mp4': 'mp4',
    'image/x-xbitmap': 'xbm',
    'video/x-rad-screenplay': 'avx',
    'video/x-sgi-movie': 'movie',
    'audio/x-ms-wma': 'wma',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.oasis.opendocument.presentation': 'odp',
    'video/x-ms-asf': 'asf',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.apple.keynote': 'key',
    'image/vnd.adobe.premiere': 'ppj',
    'application/vnd.apple.numbers': 'numbers',
    'application/eps': 'eps',
    'audio/basic': 'au'
  }

  return {
    getFileIconByMimetype: getFileIconByMimetype,
    getFiletypeByMimetype: getFiletypeByMimetype,
    getFileExtension: getFileExtension
  }

  function getFiletypeByMimetype (mimeType) {
    if (mimeType in mimeTypesToFileTypes)
      return mimeTypesToFileTypes[mimeType]
    return 'generic'
  }

  /**
     * Copied and adapted from Alfresco share for use in opendesk. The next 3 functions that is.
     */
  function getFileIconByMimetype (mimetype, iconSize) {
    var fileType = getFiletypeByMimetype(mimetype)
    iconSize = typeof iconSize === 'number' ? iconSize : 32
    return fileType + '-file-' + iconSize + '.png'
  }

  /**
     * Returns the extension from file url or path
     *
     * @method getFileExtension
     * @param filePath {string} File path from which to extract file extension
     * @return {string|null} File extension or null
     * @static
     */
  function getFileExtension (filePath) {
    var match = (String(filePath)).match(/^.*\.([^.]*)$/)
    if (Array.isArray(match) && (typeof (match[1]) === 'string' || match instanceof String))
      return match[1]

    return null
  }
}
