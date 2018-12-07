// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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