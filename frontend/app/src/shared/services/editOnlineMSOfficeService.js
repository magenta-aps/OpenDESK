angular
  .module('openDeskApp')
  .factory('editOnlineMSOfficeService', ['fileUtilsService', 'BROWSER_CONFIG', 'UserService', 'MemberService',
    '$window', '$mdToast', '$translate', editOnlineMSOfficeService])

function editOnlineMSOfficeService (fileUtilsService, BROWSER_CONFIG, UserService, MemberService, $window, $mdToast,
  $translate) {
  var toastDelay = 5000
  var msProtocolNames = {
    'doc': 'ms-word',
    'docx': 'ms-word',
    'docm': 'ms-word',
    'dot': 'ms-word',
    'dotx': 'ms-word',
    'dotm': 'ms-word',
    'xls': 'ms-excel',
    'xlsx': 'ms-excel',
    'xlsb': 'ms-excel',
    'xlsm': 'ms-excel',
    'xlt': 'ms-excel',
    'xltx': 'ms-excel',
    'xltm': 'ms-excel',
    'ppt': 'ms-powerpoint',
    'pptx': 'ms-powerpoint',
    'pot': 'ms-powerpoint',
    'potx': 'ms-powerpoint',
    'potm': 'ms-powerpoint',
    'pptm': 'ms-powerpoint',
    'pps': 'ms-powerpoint',
    'ppsx': 'ms-powerpoint',
    'ppam': 'ms-powerpoint',
    'ppsm': 'ms-powerpoint',
    'sldx': 'ms-powerpoint',
    'sldm': 'ms-powerpoint'
  }

  var appNames = {
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    docm: 'application/vnd.ms-word.document.macroenabled.12',
    dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    dotm: 'application/vnd.ms-word.template.macroenabled.12',

    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pptm: 'application/vnd.ms-powerpoint.presentation.macroenabled.12',
    ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    ppsm: 'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
    potx: 'application/vnd.openxmlformats-officedocument.presentationml.template',
    potm: 'application/vnd.ms-powerpoint.template.macroenabled.12',
    ppam: 'application/vnd.ms-powerpoint.addin.macroenabled.12',
    sldx: 'application/vnd.openxmlformats-officedocument.presentationml.slide',
    sldm: 'application/vnd.ms-powerpoint.slide.macroEnabled.12',

    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
    xltm: 'application/vnd.ms-excel.template.macroenabled.12',
    xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
    xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12'
  }

  /**
     * Valid online edit mimetypes, mapped to application ProgID.
     * Currently allowed are Microsoft Office 2003 and 2007 mimetypes for Excel, PowerPoint and Word only
     *
     * @property onlineEditMimetypes
     * @type object
     */
  var onlineEditMimetypes = {
    'application/msword': 'Word.Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word.Document',
    'application/vnd.ms-word.document.macroenabled.12': 'Word.Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'Word.Document',
    'application/vnd.ms-word.template.macroenabled.12': 'Word.Document',

    'application/vnd.ms-powerpoint': 'PowerPoint.Slide',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint.Slide',
    'application/vnd.ms-powerpoint.presentation.macroenabled.12': 'PowerPoint.Slide',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'PowerPoint.Slide',
    'application/vnd.ms-powerpoint.slideshow.macroenabled.12': 'PowerPoint.Slide',
    'application/vnd.openxmlformats-officedocument.presentationml.template': 'PowerPoint.Slide',
    'application/vnd.ms-powerpoint.template.macroenabled.12': 'PowerPoint.Slide',
    'application/vnd.ms-powerpoint.addin.macroenabled.12': 'PowerPoint.Slide',
    'application/vnd.openxmlformats-officedocument.presentationml.slide': 'PowerPoint.Slide',
    'application/vnd.ms-powerpoint.slide.macroEnabled.12': 'PowerPoint.Slide',

    'application/vnd.ms-excel': 'Excel.Sheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel.Sheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'Excel.Sheet',
    'application/vnd.ms-excel.sheet.macroenabled.12': 'Excel.Sheet',
    'application/vnd.ms-excel.template.macroenabled.12': 'Excel.Sheet',
    'application/vnd.ms-excel.addin.macroenabled.12': 'Excel.Sheet',
    'application/vnd.ms-excel.sheet.binary.macroenabled.12': 'Excel.Sheet',
    'application/vnd.visio': 'Visio.Drawing',
    'application/vnd.visio2013': 'Visio.Drawing'
  }

  var service = {
    editOnline: editOnline
  }
  return service

  function getOnlineEditUrlPathParts (doc, docMetadata) {
    return {
      start: docMetadata.serverURL,
      end: doc.webdavUrl.replace('webdav', 'aos')
    }
  }

  function createOnlineEditUrl (doc, docMetadata) {
    var urlParts = getOnlineEditUrlPathParts(doc, docMetadata)
    return urlParts.start + '/alfresco' + urlParts.end
  }

  // AOS will be used for MS Office 2013 and above
  function createOnlineEditUrlAos (doc, docMetadata) {
    var urlParts = getOnlineEditUrlPathParts(doc, docMetadata)
    var ext = fileUtilsService.getFileExtension(urlParts.end)
    var protocol = msProtocolNames[ext]
    return protocol + ':ofe%7Cu%7C' + urlParts.start + '/alfresco' + urlParts.end
  }

  /**
     * Edit Online.
     *
     * @method editOnline
     * @param siteNodeRef {String} nodeRef of the site
     * @param doc {object} Object literal representing file to be edited
     * @param metadata {object} Object literal representing metadata of the filed to be edited
     */
  function editOnline (siteNodeRef, doc, metadata) {
    // Edit online fails for files which URL is too long
    if (doc.onlineEditUrl === undefined)
      doc.onlineEditUrl = createOnlineEditUrl(doc, metadata)

    // Check if either the URL's length is greater than 256:
    if (doc.onlineEditUrl.length > 256 || encodeURI(doc.onlineEditUrl).length > 256)
    // Try to use alternate edit online URL: http://{host}:{port}/{context}/_IDX_SITE_{site_uuid}/_IDX_NODE_{document_uuid}/{document_name}
      if (siteNodeRef !== undefined) {
        var siteUUID = siteNodeRef.split('/').pop()
        var docUUID = doc.node.nodeRef.split('/').pop()
        doc.onlineEditUrl = doc.onlineEditUrl.split(doc.location.site.name)[0] + '_IDX_SITE_' + siteUUID + '/_IDX_NODE_' + docUUID + '/' + doc.location.file
        if (doc.onlineEditUrl.length > 256) {
          var ext = doc.displayName.split('.').pop()
          var docName = doc.location.file.split('.')[0]
          var exceed = doc.onlineEditUrl.length - 256
          doc.onlineEditUrl = doc.onlineEditUrl.replace(doc.location.file, docName.substring(0, docName.length - exceed - 1) + '.' + ext)
        }
        if (encodeURI(doc.onlineEditUrl).length > 256) {
          // If we get here it might be that the filename contains a lot of space characters that (when converted to %20)
          // would lead to a total encoded URL length that's greater than 256 characters.
          // Since it's a very rare case we'll just reduce the doc's display name (from the URL)
          // to a (presumably) safe size of 5 characters plus extension.
          var ext = doc.location.file.split('.').pop()
          var docName = doc.onlineEditUrl.split('/').pop()
          var docNameReduced = docName.split('.')[0].substring(0, 5) + '.' + ext
          doc.onlineEditUrl = doc.onlineEditUrl.replace(docName, docNameReduced)
        }
        editOnlineInternal(doc, metadata)
      } else {
        editOnlineInternal(doc, metadata)
      }

    else
      editOnlineInternal(doc, metadata)
  }

  function editOnlineInternal (doc, metadata) {
    if (doc.onlineEditUrl.length > 256 || encodeURI(doc.onlineEditUrl).length > 256) {
      $mdToast.show(
        $mdToast.simple()
          .textContent($translate.instant('EDIT_MS_OFFICE.PATH.FAILURE', { url: doc.onlineEditUrl }))
          .hideDelay(toastDelay)
      )
    } else if (doc.node.isLocked) {
      var checkedOut = doc.node.aspects.indexOf('cm:checkedOut') > -1
      var lockOwner = doc.node.properties['cm:lockOwner']
      var currentUser = UserService.get().userName
      var differentLockOwner = lockOwner.userName !== currentUser

      // If locked for editing then display error message about who locked
      if (checkedOut && differentLockOwner)
        MemberService.get(lockOwner).then(function (user) {
          $mdToast.show(
            $mdToast.simple()
              .textContent($translate.instant('EDIT_MS_OFFICE.ALREADY_LOCKED', {userName: user.userName}))
              .hideDelay(toastDelay)
          )
        })

      else
      // First try ActiveX plugin then AOS
      if (!launchOnlineEditorActiveX(doc, metadata))
        launchOnlineEditorAos(doc, metadata)
    } else {
      // First try ActiveX plugin then AOS
      if (!launchOnlineEditorActiveX(doc, metadata))
        launchOnlineEditorAos(doc, metadata)
    }
  }

  /**
     * Opens the appropriate Microsoft Office application for online editing.
     * Supports: Microsoft Office 2003, 2007 & 2010.
     *
     * @method launchOnlineEditorActiveX
     * @param doc {object} Object literal representing file to be edited
     * @param metadata {object} Object literal representing metadata of the filed to be edited
     * @return {boolean} True if the action was completed successfully, false otherwise.
     */
  function launchOnlineEditorActiveX (doc, metadata) {
    var controlProgID = 'SharePoint.OpenDocuments'
    var mimetype = doc.node.mimetype
    var appProgID = null
    var extn = fileUtilsService.getFileExtension(doc.location.file)

    // Try to resolve the doc to an application ProgID; by mimetype first, then file extension.
    if (onlineEditMimetypes.hasOwnProperty(mimetype)) { appProgID = onlineEditMimetypes[mimetype] } else
    if (extn !== null) {
      extn = extn.toLowerCase()
      if (appNames.hasOwnProperty(extn)) {
        mimetype = appNames[extn]
        if (onlineEditMimetypes.hasOwnProperty(mimetype))
          appProgID = onlineEditMimetypes[mimetype]
      }
    }

    if (appProgID !== null) {
      // Ensure we have the doc's onlineEditUrl populated
      if (doc.onlineEditUrl === undefined)
        doc.onlineEditUrl = createOnlineEditUrl(doc, metadata)

      if (BROWSER_CONFIG.isIE)
        return launchOnlineEditorIE(controlProgID, doc.onlineEditUrl, appProgID)

      return false
    }

    // No success in launching application via ActiveX control
    return false
  }

  /**
     * Opens the appropriate Microsoft Office application for online editing.
     * Supports: Microsoft Office 2003, 2007 & 2010.
     *
     * @method launchOnlineEditorIE
     * @param controlProgID
     * @param onlineEditUrl {String} String representing the edit url to the file to be edited
     * @param appProgID
     * @return {boolean} True if the action was completed successfully, false otherwise.
     */
  function launchOnlineEditorIE (controlProgID, onlineEditUrl, appProgID) {
    // Try each version of the SharePoint control in turn, newest first
    var activeXControl = null
    try {
      if (appProgID === 'Visio.Drawing')
        throw ('Visio should be invoked using activeXControl.EditDocument2.')
      activeXControl = new ActiveXObject(controlProgID + '.3')
      return activeXControl.EditDocument3($window, onlineEditUrl, true, appProgID)
    } catch (e) {
      try {
        activeXControl = new ActiveXObject(controlProgID + '.2')
        return activeXControl.EditDocument2($window, onlineEditUrl, appProgID)
      } catch (e1) {
        try {
          activeXControl = new ActiveXObject(controlProgID + '.1')
          return activeXControl.EditDocument(onlineEditUrl, appProgID)
        } catch (e2) {
          // Do nothing
        }
      }
    }
    return false
  }

  /**
     * Edit Online with AOS.
     *
     * @method launchOnlineEditorAos
     * @param doc {object} Object literal representing file to be edited
     * @param metadata {object} Object literal representing metadata of the filed to be edited
     */
  function launchOnlineEditorAos (doc, metadata) {
    // Ensure we have the doc's onlineEditUrlAos populated
    if (doc.onlineEditUrlAos === undefined)
      doc.onlineEditUrlAos = createOnlineEditUrlAos(doc, metadata)

    if (BROWSER_CONFIG.isIOS)
      launchOfficeOnIosAos(doc.onlineEditUrlAos)

    // detect if we are on a supported operating system
    if (!BROWSER_CONFIG.isWin && !BROWSER_CONFIG.isMac)
      $mdToast.show(
        $mdToast.simple()
          .textContent($translate.instant('EDIT_MS_OFFICE.AOS.NO_SUPPORTED_ENVIRONMENT'))
          .hideDelay(toastDelay)
      )
    else
      tryToLaunchOfficeByMsProtocolHandlerAos(doc.onlineEditUrlAos)
  }

  function launchOfficeOnIosAos (url) {
    var iframe = document.createElement('iframe')
    iframe.setAttribute('style', 'display: none; height: 0; width: 0;')
    document.getElementsByTagName('body')[0].appendChild(iframe)
    iframe.src = url
  }

  function tryToLaunchOfficeByMsProtocolHandlerAos (url) {
    var protocolHandlerPresent = false

    var input = document.createElement('input')
    var inputTop = document.body.scrollTop + 10
    input.setAttribute('style', 'z-index: 1000; background-color: rgba(0, 0, 0, 0); border: none; ' +
            'outline: none; position: absolute; left: 10px; top: ' + inputTop + 'px;')
    document.getElementsByTagName('body')[0].appendChild(input)
    input.focus()
    input.onblur = function () {
      protocolHandlerPresent = true
    }
    input.context = this
    location.href = url
    setTimeout(function () {
      input.onblur = null
      input.remove()
      if (!protocolHandlerPresent)
        $mdToast.show(
          $mdToast.simple()
            .textContent($translate.instant('EDIT_MS_OFFICE.AOS.SUPPORTED_OFFICE_VERSION_REQUIRED'))
            .hideDelay(toastDelay)
        )
    }, 500)
  }
}
