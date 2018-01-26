var logoutPage = require('./logoutPage.po.js');

describe('OpenDesk AuthController', function () {
    it('should be able to logout', function () {
        logoutPage.logout();
        expect(browser.getCurrentUrl()).toContain('/login');
    });
});