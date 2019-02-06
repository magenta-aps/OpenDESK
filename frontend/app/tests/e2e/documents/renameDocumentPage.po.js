// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var constants = require('../common/constants');
var documentHelper = require('./documentHelper.js');

var RenameDocumentPage = function () {

	return {

		renameDocument: function (document,newName) {
            documentHelper.findDocumentInList(document).then(function (response) {
                expect(response.length).toBe(1);

                documentHelper.openOptionMenu(response[0]);
				documentHelper.renameAction(newName);
            });
        }
	};
};

module.exports = RenameDocumentPage();