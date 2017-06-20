var globalHeaderMenu = require('../common/globalHeader.po.js');

var LogoutPage = function () {

    return {

        logout: function () {
            globalHeaderMenu.getHeaderMenuItem().userMenuBtn.click();
            element(by.css('#logout')).click();
            browser.driver.sleep(2000);
        }

    }
};

module.exports = LogoutPage();