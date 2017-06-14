var globalHeaderMenu = require('../common/globalHeader.po.js');

var LogoutPage = function () {

    var public = {};

    public.logout = function () {
        globalHeaderMenu.getHeaderMenuItem().userMenuBtn.click();
        element(by.css('#logout')).click();
        browser.driver.sleep(2000);
    };

    return public;
};

module.exports = LogoutPage();