var replyText;

var CreateReplyPage = function () {

	return {
		getDiscussionThreadTitle: function() {
			return element(by.css('h1.discussion-title'));
		},

		openCreateReplyDialog: function () {
			return element(by.css('[aria-label="Reply"]')).click();
		},

		fillInputFields: function (reply) {
			replyText = reply;
			//var replyContentInput = element(by.css('.cke_wysiwyg_frame'));
            //var replyContentInput = element(by.xpath('//*[@id="cke_3_contents"]/iframe'));
            //browser.switchTo().frame(replyContentInput);
            //var body = element(by.css('body'));
            //body.sendKeys('hello world');
            //browser.driver.sleep(5000);
            //browser.switchTo().defaultContent();

		},

		createReply: function () {
			return element(by.css('[aria-label="Reply"] button[type="submit"]')).click();
		},
	};
};

module.exports = CreateReplyPage();