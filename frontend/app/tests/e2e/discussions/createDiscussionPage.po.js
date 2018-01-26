var constants = require('../common/constants');
var discussionList;

var CreateDiscussionPage = function () {

	return {
		getDiscussionList: function () {
			discussionList = element.all(by.css('td a.od-filebrowser-link h3'));
			return discussionList.getInnerHtml();
		},

		getDiscussionTitle: function() {
			return element(by.css('h1.discussion-title')).getText();
		},

		gotoDiscussionsTab: function() {
			return element(by.xpath('//md-tabs/md-tabs-wrapper/md-tabs-canvas/md-pagination-wrapper/md-tab-item[2]')).click();
		},

		goBackToDiscussions: function() {
			return element(by.css('.discussion-back')).click();
		},

		openCreateDiscussionDialog: function () {
			return element(by.css('[aria-label="ny diskussion"]')).click();
		},

		fillInputFields: function (discussion) {
			discussionName = discussion;
			var disussionTitleInput = element(by.model('newDiscussionTitle'));
			var disussionContentInput = element(by.css('.cke_wysiwyg_frame'));

			disussionTitleInput.sendKeys(constants.DISCUSSION_TITLE);

			browser.switchTo().frame(element(by.css('.cke_wysiwyg_frame')).click());
			browser.actions().sendKeys(constants.DISCUSSION_CONTENT).perform();
			browser.driver.sleep(500);
			browser.switchTo().defaultContent();
		},

		createDiscussion: function () {
			return element(by.css('[aria-label="New comment"] button[type="submit"]')).click();
		},

		openDiscussionWithTitle: function (title) {
			return element.all(by.repeater('discussion in dc.discussions')).filter(function(elem) {
				//Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(title) >= 0;
                });
			});
		}
	};
};

module.exports = CreateDiscussionPage();