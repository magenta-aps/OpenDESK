var globalHeader = require('../common/globalHeader.po.js');
var loginPage = require('./loginPage.po.js');

describe('OpenDesk AuthController', function () {

    //TODO: refactor so the expects checks the session cookie instead

    it('should be able to login', function () {
        loginPage.loginAsAdmin();
        expect(browser.getCurrentUrl()).toContain('/#!/projekter');
    });

    it('should be able to logout', function () {
        loginPage.logout();
        expect(browser.getCurrentUrl()).toContain('/#!/login');
    });
});