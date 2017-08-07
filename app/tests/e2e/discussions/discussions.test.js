var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var createDiscussionPage = require('./createDiscussionPage.po.js');
var createReplyPage = require('./createReplyPage.po.js');

describe('OpenDesk discussions', function () {

    it('should go to the default project', function () {
            projectHelper.openDefaultProject();
    });

    it('should go to discussions tab', function () {
        createDiscussionPage.gotoDiscussionsTab();
        expect(browser.getCurrentUrl()).toContain('diskussioner');
    });

    it('should create a new discussion', function () {
        createDiscussionPage.openCreateDiscussionDialog();
        createDiscussionPage.fillInputFields();
        createDiscussionPage.createDiscussion();
        expect(createDiscussionPage.getDiscussionList()).toContain(constants.DISCUSSION_TITLE);
    });

    it('should open the discussion', function() {
        createDiscussionPage.openDiscussionWithTitle(constants.DISCUSSION_TITLE).then(function(response) {
            expect(response.length).toBe(1);
            response[0].all(by.css('.od-filebrowser-link')).first().click();
            expect(createDiscussionPage.getDiscussionTitle()).toBe(constants.DISCUSSION_TITLE);
        });
    });

    it('should create a new reply', function () {
        createReplyPage.openCreateReplyDialog();
        createReplyPage.fillInputFields(constants.REPLY_CONTENT);
        createReplyPage.createReply();

        createReplyPage.getAllReplies2().then(function(response) {
            expect(response[response.length-1].getText()).toContain(constants.REPLY_CONTENT)
        });
    });

    it('should delete the reply', function() {
        createReplyPage.getAllReplies2().then(function(response) {
            var actionMenu = response[response.length-1].all(by.css('[ng-click="$mdMenu.open()"]')).last();
            var deleteBtn = element.all(by.css('[ng-click="dc.deleteDiscussion(reply)"]')).last();
            actionMenu.click();
            deleteBtn.click();

            createReplyPage.getAllReplies2().then(function(res) {
                expect(res[res.length-1].getText()).toContain('[[deleted]]');
            });
        });
    });

    it('should go back to discussions', function () {
        createDiscussionPage.goBackToDiscussions();
        expect(browser.getCurrentUrl()).toContain('diskussioner');
    });

    it('should delete the discussion', function() {
        createDiscussionPage.openDiscussionWithTitle(constants.DISCUSSION_TITLE).then(function(response) {
            expect(response.length).toBe(1);
            response[0].all(by.css('[ng-click="$mdMenu.open()"]')).first().click();
            element.all(by.css('[ng-click="dc.deleteDiscussion(discussion)"]')).last().click();
            
            createDiscussionPage.openDiscussionWithTitle(constants.DISCUSSION_TITLE).then(function(response) {
                expect(response.length).toBe(0);
            });
        });
    });
});