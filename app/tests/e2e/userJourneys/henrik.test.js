var globalHeader = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var loginPage = require('../login/loginPage.po.js');
var logoutPage = require('../login/logoutPage.po.js');

var projectHelper = require('../projects/projectHelper.js');
var openProjectPage = require('../projects/openProjectPage.po.js');
var createProjectPage = require('../projects/createProjectsPage.po.js');
var renameProjectPage = require('../projects/renameProjectPage.po.js');
var deleteProjectPage = require('../projects/deleteProjectPage.po.js');

var createGroupRoomPage = require('../groupRooms/createGroupRoomPage.po.js');

var addMemberPage = require('../members/addMemberPage.po.js');
var deleteMemberPage = require('../members/deleteMemberPage.po.js');

var createFolderPage = require('../folders/createFolderPage.po.js');
var createProjectlinkPage = require('../projectlinks/createProjectlinkPage.po.js');

var uploadDocumentPage = require('../documents/uploadDocumentPage.po.js');
var deleteDocumentPage = require('../documents/deleteDocumentPage.po.js');
var renameDocumentPage = require('../documents/renameDocumentPage.po.js');

var createDiscussionPage = require('../discussions/createDiscussionPage.po.js');
var createReplyPage = require('../discussions/createReplyPage.po.js');

describe('User Henrik', function () {

    it('should login as admin', function () {
        loginPage.loginAsAdmin();
        expect(browser.getCurrentUrl()).toContain('/#!/projekter');
    });

    xdescribe('should create a new project', function () {
        it('should create a new project', function () {
            createProjectPage.openCreateProjectDialog();
            createProjectPage.fillInputFields(constants.PROJECT_NAME_1, false);
            createProjectPage.createProject();
            expect(projectHelper.getProjectPageTitle()).toContain(constants.PROJECT_NAME_1);
        });

        it('should rename the project', function () {
            renameProjectPage.showDetails();
            renameProjectPage.openEditDialog();
            renameProjectPage.editProjectName(constants.PROJECT_NAME_RENAME_NEW_NAME);
            renameProjectPage.renameProject();
            expect(projectHelper.getProjectPageTitle()).toMatch(constants.PROJECT_NAME_RENAME_NEW_NAME);
        });

        describe('should create a new folder', function () {
            it('should create a new folder', function () {
                createFolderPage.openCreateFolderDialog();
                createFolderPage.fillInputFields(constants.folder_to_be_created_an_manipulated);
                createFolderPage.createFolder();
                expect(createFolderPage.getFolderList()).toContain(createFolderPage.getCreatedFolder());
            });

            xit('should open the folder', function () {

            });
        });

        it('should create a new projectlink', function () {
            createProjectlinkPage.openCreateProjectlinkDialog();
            createProjectlinkPage.fillInputFields();
            createProjectlinkPage.createProjectlink();
        });

        xdescribe('should create a new discussion', function () {
            it('should go to discussions tab', function () {
                createDiscussionPage.gotoDiscussionsTab();
                expect(browser.getCurrentUrl()).toContain('diskussioner');
            });

            it('should create a new discussion', function () {
                createDiscussionPage.openCreateDiscussionDialog();
                createDiscussionPage.fillInputFields(constants.DISCUSSION_NAME);
                createDiscussionPage.createDiscussion();
                expect(createDiscussionPage.getDiscussionList()).toContain(constants.DISCUSSION_NAME);
            });
        });

        it('should delete the project', function () {
            deleteProjectPage.backToProjects();
            deleteProjectPage.deleteProject(constants.PROJECT_NAME_1);
            browser.driver.sleep(1000);
            expect(deleteProjectPage.getProjectList()).not.toContain(constants.PROJECT_NAME_RENAME_NEW_NAME);
        });
    });

    xdescribe('should reply to a discussion', function () {
        xit('should go to discussions tab', function () {
            createDiscussionPage.gotoDiscussionsTab();
            expect(browser.getCurrentUrl()).toContain('diskussioner');
        });

        it('should open the first discussion', function () {
            createDiscussionPage.openFirstDiscussion();
            browser.driver.sleep(1000);
            expect(createDiscussionPage.getDiscussionThreadTitle().getInnerHtml()).toBe(constants.DISCUSSION_NAME);
        });

        xit('should create a new reply', function () {
            createReplyPage.openCreateReplyDialog();
            createReplyPage.fillInputFields(constants.REPLY_CONTENT);
            createReplyPage.createReply();
        });

        it('should go back to discussions', function () {
            createDiscussionPage.goBackToDiscussions();
            expect(browser.getCurrentUrl()).toContain('diskussioner');
        });
    });

    xdescribe('should create a new group room', function () {
        it('should create a new group room', function () {
            createGroupRoomPage.openCreateGroupRoomDialog();
            createGroupRoomPage.fillInputFields(constants.PROJECT_NAME_2, false);
            createGroupRoomPage.createGroupRoom();
        });

        xit('should be able to be deleted', function () {
            return browser.get("http://localhost:8000/#!/projekter").then(function (response) {
                deleteProjectPage.deleteProject(constants.PROJECT_NAME_2);
            });
        });
    });

    describe('should use an existing project', function () {
        it('should open the first project', function () {
            openProjectPage.openProject(constants.PROJECT_EXISTING);
            browser.driver.sleep(1000);
            expect(projectHelper.getProjectPageTitle()).toContain(constants.PROJECT_EXISTING);
        });

        describe('should work with documents', function () {
            it('should upload a new document', function () {
                uploadDocumentPage.openUploadDocumentDialog();
                uploadDocumentPage.fillInputFields();
                uploadDocumentPage.uploadDocument();
                browser.driver.sleep(1000);
                expect(uploadDocumentPage.getDocumentList()).toContain(uploadDocumentPage.getDocumentName());
            });

            it('should rename the document', function () {
                renameDocumentPage.renameDocument(constants.file_renamed);
                expect(renameDocumentPage.getDocumentList()).toContain(constants.file_renamed);
            });

            xit('should open the document', function () {

            });

            it('should delete the document', function () {
                browser.driver.sleep('1000');
                expect(deleteDocumentPage.getDocumentList()).toContain(constants.file_renamed);
                deleteDocumentPage.deleteDocument(constants.file_renamed);
                expect(deleteDocumentPage.getDocumentList()).not.toContain(constants.file_renamed);
            });
        });

        xdescribe('should add a member', function () {
            it('should add a new member', function () {
                addMemberPage.openAddMemberDialog();
                addMemberPage.fillInputFields();
                addMemberPage.addMember();
                expect(addMemberPage.getProjectMembers()).toContain(constants.added_member);
            });

            it('should delete a member', function () {
                deleteMemberPage.openDeleteMemberDialog();
                deleteMemberPage.deleteChip();
                deleteMemberPage.deleteMember();
                expect(deleteMemberPage.getProjectMembers()).not.toContain(constants.added_member);
            });
        });
    });

    it('should logout', function () {
        logoutPage.logout();
    });
});