'use strict'
import '../../alfrescoDocument.service'
import '../../alfrescoDownload.service'
import '../../document/preview/preview.controller'
import previewDialogTemplate from './view/previewDialog.html'
import audioTemplate from './view/audio.html'
import videoTemplate from './view/video.html'
import strobeMediaPlayBackTemplate from './view/strobeMediaPlayBack.html'
import imageTemplate from './view/image.html'
import onlyOfficeTemplate from './view/onlyOffice.html'
import pdfTemplate from './view/pdf.html'
import webTemplate from './view/web.html'
import cannotPreviewTemplate from './view/cannotPreview.html'
import previewManagerTemplate from './view/previewManager.html'

angular
  .module('openDeskApp')
  .factory('documentPreviewService', ['$mdDialog', '$timeout', 'alfrescoDocumentService',
    'alfrescoDownloadService', 'sessionService', '$http', '$sce', 'ALFRESCO_URI', 'EDITOR_CONFIG', 'APP_BACKEND_CONFIG',
    PreviewService])
  .component('audioPreview', {template: audioTemplate, bindings: { plugin: '=' }})
  .component('videoPreview', {template: videoTemplate, bindings: { plugin: '=' }})
  .component('strobeMediaPlayBackPreview', {template: strobeMediaPlayBackTemplate, bindings: { plugin: '=' }})
  .component('imagePreview', {template: imageTemplate, bindings: { plugin: '=' }})
  .component('onlyOfficePreview', {template: onlyOfficeTemplate, bindings: { plugin: '=' }})
  .component('pdfPreview', {template: pdfTemplate, bindings: { plugin: '=' }})
  .component('webPreview', {template: webTemplate, bindings: { plugin: '=' }})
  .component('cannotPreviewPreview', {template: cannotPreviewTemplate, bindings: { plugin: '=' }})
  .component('previewManager', {template: previewManagerTemplate, bindings: { plugin: '=', template: '=' }})

function PreviewService ($mdDialog, $timeout, alfrescoDocumentService, alfrescoDownloadService,
  sessionService, $http, $sce, ALFRESCO_URI, EDITOR_CONFIG, APP_BACKEND_CONFIG) {
  var service = {
    previewDocument: previewDocument,
    getPlugin: getPlugin,
    getPluginByNodeRef: getPluginByNodeRef
  }
  return service

  function previewDocument (nodeRef) {
    getPluginByNodeRef(nodeRef).then(function (plugin) {
      previewDialog(plugin)
    })
  }

  function getPluginByNodeRef (nodeRef) {
    return alfrescoDocumentService.retrieveSingleDocument(nodeRef)
      .then(function (response) {
        var item = response.node
        item.lastThumbnailModificationData = response.node.properties['cm:lastThumbnailModification']
        item.name = response.location.file
        item.thumbnailDefinitions = response.thumbnailDefinitions
        return getPlugin(item)
      })
  }

  function previewDialog (plugin) {
    return $mdDialog.show({
      controller: 'PreviewController',
      controllerAs: 'vm',
      template: previewDialogTemplate,
      parent: angular.element(document.body),
      targetEvent: null,
      clickOutsideToClose: true,
      locals: {
        plugin: plugin
      }
    })
  }

  function getPlugin (item) {
    var plugins = getPlugins()
    for (var i in plugins) {
      var plugin = plugins[i]
      if (plugin.acceptsItem(item)) {
        plugin.initPlugin(item)
        if (plugin.extendPlugin)
          plugin.extendPlugin()
        return plugin
      }
    }
  }

  function getPlugins () {
    return [
      audioViewer(),
      onlyOfficeViewer(),
      webViewer(),
      pdfViewer(),
      imageViewer(),
      videoViewer(),
      strobeMediaPlayback(),
      cannotPreviewPlugin()
    ]
  }

  function audioViewer () {
    var viewer = {
      mimeTypes: ['audio/x-wav'],
      name: 'audio'
    }
    var result = generalPlaybackPlugin()
    return angular.extend(result, viewer)
  }

  function videoViewer () {
    var viewer = {
      mimeTypes: [
        'video/ogg',
        'video/webm',
        'video/x-m4v',
        'video/mp4'
      ],
      name: 'video'
    }
    var result = generalPlaybackPlugin()
    return angular.extend(result, viewer)
  }

  function strobeMediaPlayback () {
    var viewer = {
      mimeTypes: [
        'video/x-m4v',
        'video/x-flv',
        'video/mp4',
        'video/quicktime',
        'audio/mpeg'
      ],
      name: 'strobeMediaPlayBack'
    }

    var result = generalPlaybackPlugin()
    return angular.extend(result, viewer)
  }

  function imageViewer () {
    var viewer = {
      mimeTypes: [
        'image/png',
        'image/gif',
        'image/jpeg'
      ],
      thumbnail: 'imgpreview',
      name: 'image',
      maxItemSize: 20000000,
      extendPlugin: function () {
        this.itemMaxSizeExceeded = (this.itemSize && parseInt(this.itemSize) > this.maxItemSize)
      }
    }
    var result = generalPreviewPlugin()
    return angular.extend(result, viewer)
  }

  function onlyOfficeViewer () {
    var viewer = {
      mimeTypes: APP_BACKEND_CONFIG.editors.onlyOffice ? EDITOR_CONFIG.lool.mimeTypes : [],
      name: 'onlyOffice'
    }

    var result = generalPlaybackPlugin()
    return angular.extend(result, viewer)
  }

  function pdfViewer () {
    var viewer = {
      transformableMimeTypes: EDITOR_CONFIG.lool.mimeTypes,
      mimeTypes: ['application/pdf'],
      thumbnail: 'pdf',
      name: 'pdf',
      height: '75vh'
    }
    var result = generalPreviewPlugin()
    return angular.extend(result, viewer)
  }

  function webViewer () {
    var viewer = {
      mimeTypes: [
        'text/plain',
        'text/html',
        'text/xml',
        'text/xhtml+xml'
      ],
      name: 'web',
      extendPlugin: function () {
        var _this = this
        $http.get(this.contentUrl).then(function (response) {
          if (_this.mimeType === 'text/html' || _this.mimeType === 'text/xhtml+xml')
            _this.htmlContent = $sce.trustAsHtml(response.data)
          else
            _this.plainTextContent = response.data
        })
      }
    }
    var result = generalPreviewPlugin()
    return angular.extend(result, viewer)
  }

  function cannotPreviewPlugin () {
    var viewer = {
      name: 'cannotPreview',
      _acceptsMimeType: function (item) {
        return true
      }
    }
    return angular.extend(generalPreviewPlugin(), viewer)
  }

  function generalPlaybackPlugin () {
    var plugin = {
      extendPlugin: function () {
        var hostUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
        this.contentUrl = hostUrl + this.contentUrl
      }
    }
    var result = generalPreviewPlugin()
    return angular.extend(result, plugin)
  }

  function generalPreviewPlugin () {
    return {
      acceptsItem: function (item) {
        return this._acceptsMimeType(item) ||
                    this._acceptsThumbnail(item) ||
                    this._acceptsTransformableMimeTypes(item)
      },

      initPlugin: function (item) {
        this.nodeRef = item.nodeRef
        this.fileName = item.name
        this.itemSize = item.size
        this.mimeType = item.mimetype
        if (item.thumbnailUrl === undefined)
          item.thumbnailUrl = this._getThumbnailUrl(item)
        this.thumbnailUrl = ALFRESCO_URI.webClientServiceProxy + item.thumbnailUrl
        this.thumbnailUrl = sessionService.makeURL(this.thumbnailUrl)
        if (this._acceptsMimeType(item)) {
          this.contentUrl = ALFRESCO_URI.webClientServiceProxy + item.contentURL
          this.contentUrl = sessionService.makeURL(this.contentUrl)
        } else {
          this.contentUrl = this.thumbnailUrl
        }
      },

      _acceptsMimeType: function (item) {
        if (this.mimeTypes === null || this.mimeTypes === undefined)
          return false

        return this.mimeTypes.indexOf(item.mimetype) !== -1
      },

      _acceptsTransformableMimeTypes: function (item) {
        if (this.transformableMimeTypes === null || this.transformableMimeTypes === undefined)
          return false

        return this.transformableMimeTypes.indexOf(item.mimetype) !== -1
      },

      _acceptsThumbnail: function (item) {
        if (this.thumbnail === null || this.thumbnail === undefined ||
                    item.thumbnailDefinitions === null || item.thumbnailDefinitions === undefined)
          return false

        return item.thumbnailDefinitions.indexOf(this.thumbnail) !== -1
      },

      _getThumbnailUrl: function (item) {
        var nodeRefAsLink = this.nodeRef.replace(':/', '')
        var noCache = new Date().getTime()
        var lastModified = this._getLastThumbnailModification(item)
        return '/api/node/' + nodeRefAsLink + '/content/thumbnails/' + this.thumbnail +
          '?c=force&noCache=' + noCache + lastModified
      },

      _getLastThumbnailModification: function (item) {
        var thumbnailModifications = item.lastThumbnailModificationData
        if (!thumbnailModifications)
          thumbnailModifications = []

        for (var i in thumbnailModifications) {
          var thumbnailModification = thumbnailModifications[i]
          if (thumbnailModification.indexOf(this.thumbnail) !== -1)
            return '&lastModified=' + encodeURIComponent(thumbnailModification)
        }
        return ''
      }
    }
  }
}
