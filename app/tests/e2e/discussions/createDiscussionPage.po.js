var discussionName;
var discussionList;

var CreateDiscussionPage = function () {

	return {
		getDiscussionList: function () {
			discussionList = element.all(by.css('td a.od-filebrowser-link h3'));
			return discussionList.getInnerHtml();
		},

		getDiscussionThreadTitle: function() {
			return element(by.css('.discussion-title"]'));
		},

		getCreatedDiscussion: function () {
			return discussionName;
		},

		gotoDiscussions: function() {
			return element(by.xpath('//md-tabs/md-tabs-wrapper/md-tabs-canvas/md-pagination-wrapper/md-tab-item[2]')).click();
		},

		openCreateDiscussionDialog: function () {
			return element(by.css('[aria-label="ny diskussion"]')).click();
		},

		fillInputFields: function (discussion) {
			discussionName = discussion;
			var disussionTitleInput = element(by.model('newDiscussionTitle'));
			var disussionContentInput = element(by.css('iframe.cke_wysiwyg_frame'));

			disussionTitleInput.sendKeys(discussionName);
		},

		createDiscussion: function () {
			return element(by.css('[aria-label="New conversation"] button[type="submit"]')).click();
		},

		openDiscussion: function () {

		}
	};
};

module.exports = CreateDiscussionPage();