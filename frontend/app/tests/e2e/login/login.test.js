// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var loginPage = require('./loginPage.po.js');

describe('OpenDesk AuthController', function () {
    it('should be able to login', function () {
        loginPage.loginAsAdmin();
        expect(browser.getCurrentUrl()).toContain('/projekter');
    });
});