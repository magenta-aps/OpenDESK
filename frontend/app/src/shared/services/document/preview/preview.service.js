//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
import '../../alfrescoDocument.service'
import '../../alfrescoDownload.service'
import '../../document/preview/preview.controller'
import previewDialogTemplate from './view/previewDialog.html'
import audioTemplate from './view/audio.html'
import videoTemplate from './view/video.html'
import imageTemplate from './view/image.html'
import onlyOfficeTemplate from './view/onlyOffice.html'
import libreOfficeTemplate from './view/libreOffice.html'
import pdfTemplate from './view/pdf.html'
import webTemplate from './view/web.html'
import cannotPreviewTemplate from './view/cannotPreview.html'
import previewManagerTemplate from './view/previewManager.html'

angular
  .module('openDeskApp')
  .factory('documentPreviewService', ['$mdDialog', '$timeout', 'alfrescoDocumentService',
    'alfrescoDownloadService', 'editorService', 'sessionService', '$http', '$sce', 'ALFRESCO_URI', PreviewService])
  .component('audioPreview', {template: audioTemplate, bindings: { plugin: '=' }})
  .component('videoPreview', {template: videoTemplate, bindings: { plugin: '=' }})
  .component('imagePreview', {template: imageTemplate, bindings: { plugin: '=' }})
  .component('onlyOfficePreview', {template: onlyOfficeTemplate, bindings: { plugin: '=' }})
  .component('libreOfficePreview', {template: libreOfficeTemplate, bindings: { plugin: '=' }})
  .component('pdfPreview', {template: pdfTemplate, bindings: { plugin: '=' }})
  .component('webPreview', {template: webTemplate, bindings: { plugin: '=' }})
  .component('cannotPreviewPreview', {template: cannotPreviewTemplate, bindings: { plugin: '=' }})
  .component('previewManager', {template: previewManagerTemplate, bindings: { plugin: '=', template: '=' }})

function PreviewService ($mdDialog, $timeout, alfrescoDocumentService, alfrescoDownloadService,
  editorService, sessionService, $http, $sce, ALFRESCO_URI) {
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

    var plugin;

    for (var i in plugins) {
      var plugin = plugins[i]
      console.log(i)
      console.log(plugin)
      console.log(plugin.acceptsItem(item));
      console.log("next")

//      if (plugin.acceptsItem(item)) {
//        plugin.initPlugin(item)
//        if (plugin.extendPlugin)
//          plugin.extendPlugin()
//
//      }
    }
      return plugin
  }

  function getPlugins () {
    return [
      officeViewer('onlyOffice'),
      officeViewer('libreOffice'),
      webViewer(),
      pdfViewer(),
      audioViewer(),
      videoViewer(),
      imageViewer(),
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

  function officeViewer (name) {
    var isEnabled = editorService.isEnabled(name)
    var viewer = {
      mimeTypes: isEnabled ? editorService.getEditor(name).mimeTypes : [],
      name: name
    }

    var result = generalPlaybackPlugin()
    return angular.extend(result, viewer)
  }

  function pdfViewer () {
    var viewer = {
      transformableMimeTypes: [
        'application/clarisworks',
        'application/coreldraw',
        'application/macwriteii',
        'application/msword',
        'application/prs.plucker',
        'application/rtf',
        'application/vnd.corel-draw',
        'application/vnd.lotus-1-2-3',
        'application/vnd.lotus-wordpro',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.template.macroEnabled.12',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        'application/vnd.ms-powerpoint.template.macroEnabled.12',
        'application/vnd.ms-powerpoint',
        'application/vnd.ms-word.document.macroEnabled.12',
        'application/vnd.ms-word.template.macroEnabled.12',
        'application/vnd.ms-works',
        'application/vnd.oasis.opendocument.chart',
        'application/vnd.oasis.opendocument.database',
        'application/vnd.oasis.opendocument.graphics-flat-xml',
        'application/vnd.oasis.opendocument.graphics-template',
        'application/vnd.oasis.opendocument.graphics',
        'application/vnd.oasis.opendocument.presentation-flat-xml',
        'application/vnd.oasis.opendocument.presentation-template',
        'application/vnd.oasis.opendocument.presentation',
        'application/vnd.oasis.opendocument.spreadsheet-flat-xml',
        'application/vnd.oasis.opendocument.spreadsheet-template',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.text-flat-xml',
        'application/vnd.oasis.opendocument.text-master-template',
        'application/vnd.oasis.opendocument.text-master',
        'application/vnd.oasis.opendocument.text-template',
        'application/vnd.oasis.opendocument.text-web',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.openofficeorg.extension',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        'application/vnd.openxmlformats-officedocument.presentationml.template',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        'application/vnd.palm',
        'application/vnd.sun.xml.calc.template',
        'application/vnd.sun.xml.calc',
        'application/vnd.sun.xml.chart',
        'application/vnd.sun.xml.draw.template',
        'application/vnd.sun.xml.draw',
        'application/vnd.sun.xml.impress.template',
        'application/vnd.sun.xml.impress',
        'application/vnd.sun.xml.report.chart',
        'application/vnd.sun.xml.writer.global',
        'application/vnd.sun.xml.writer.template',
        'application/vnd.sun.xml.writer.web',
        'application/vnd.sun.xml.writer',
        'application/vnd.visio',
        'application/vnd.visio2013',
        'application/vnd.wordperfect',
        'application/x-abiword',
        'application/x-aportisdoc',
        'application/x-dbase',
        'application/x-dif-document',
        'application/x-fictionbook+xml',
        'application/x-gnumeric',
        'application/x-hwp',
        'application/x-iwork-keynote-sffkey',
        'application/x-iwork-numbers-sffnumbers',
        'application/x-iwork-pages-sffpages',
        'application/x-mspublisher',
        'application/x-mswrite',
        'application/x-pagemaker',
        'application/x-sony-bbeb',
        'application/x-t602',
        'image/cgm',
        'image/svg+xml',
        'image/vnd.dxf',
        'image/x-emf',
        'image/x-freehand',
        'image/x-wmf',
        'image/x-wpg',
        'text/csv',
        'text/spreadsheet'
      ],
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
        'text/xhtml+xml',
        'application/json'
      ],
      name: 'web',
      extendPlugin: function () {
        var _this = this
        $http.get(this.contentUrl).then(function (response) {
          if (_this.mimeType === 'text/html' || _this.mimeType === 'text/xhtml+xml')
            _this.htmlContent = $sce.trustAsHtml(response.data)
          else if (_this.mimeType === 'application/json')
            _this.jsonContent = response.data
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
          item.thumbnailUrl = this._getThumbnailUrl()
        this.thumbnailUrl = ALFRESCO_URI.webClientServiceProxy + item.thumbnailUrl
        this._addThumbnailUrlFlags(item)
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

      _getThumbnailUrl: function () {
        var nodeRefAsLink = this.nodeRef.replace(':/', '')
        return '/api/node/' + nodeRefAsLink + '/content/thumbnails/'
      },

      _addThumbnailUrlFlags: function (item) {
        var noCache = new Date().getTime()
        var lastModified = this._getLastThumbnailModification(item)
        this.thumbnailUrl += this.thumbnail + '?c=force&noCache=' + noCache + lastModified
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
