// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var constants = require('../common/constants');
var documentHelper = require('./documentHelper.js');

var DeleteDocumentPage = function () {

	return {
		getDocumentList: function () {
			var documentList = element.all(by.repeater('content in contentTypeList'));
			var documentNames = documentList.all(by.css('.content-name'));
			return documentNames.getInnerHtml();
		},

		getDeletedDocumentName: function () {
			return constants.file_4;
		},

		deleteDocument: function (fileName) {
            documentHelper.findDocumentInList(fileName).then(function (response) {
                expect(response.length).toBe(1);
                documentHelper.openOptionMenu(response[0]);
                documentHelper.deleteAction();
            });
        }
	};
};

module.exports = DeleteDocumentPage();