// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var CreateReplyPage = function () {

	return {

		openCreateReplyDialog: function () {
			return element(by.css('[aria-label="Reply"]')).click();
		},

		fillInputFields: function (reply) {
			browser.switchTo().frame(element(by.css('.cke_wysiwyg_frame')).click());
			browser.actions().sendKeys(reply).perform();
			browser.driver.sleep(500);
			browser.switchTo().defaultContent();
		},

		createReply: function () {
			return element(by.css('[aria-label="Reply"] button[type="submit"]')).click();
		},

		getAllReplies: function() {
			return replies = element.all(by.binding('reply.content'));
		},
		
		getAllReplies2: function() {
			return element.all(by.repeater('reply in dc.replies'));
		}
	};
};

module.exports = CreateReplyPage();