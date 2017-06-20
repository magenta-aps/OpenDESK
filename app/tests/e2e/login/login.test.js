var loginPage = require('./loginPage.po.js');

describe('OpenDesk AuthController', function () {
    it('should be able to login', function () {
        loginPage.loginAsAdmin();
        expect(browser.getCurrentUrl()).toContain('/#!/projekter');
    });
});