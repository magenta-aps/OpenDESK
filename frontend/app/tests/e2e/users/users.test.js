// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var userPage = require('./userPage.po.js');
var loginPage = require('../login/loginPage.po.js');

describe('openESDH case page tests', function () {

    //Executed before each of the "it" tests
    beforeEach(function () {
        loginPage.login();
    });

    //logout and wait for 2 secs
    afterEach(function () {
        loginPage.logout();
    });

    it('login as admin and navigate to users page', function () {
        userPage.goToUsersPage();
        browser.driver.sleep(1000);
        expect(element(by.repeater('user in vm.allSystemUsers').row(0).column('userName')));
    });

    it('login, navigate to users page and create user as Admin', function () {
        userPage.goToUsersPage();
        browser.driver.sleep(1000);
        expect(element(by.repeater('user in vm.allSystemUsers').row(0).column('userName')));
        userPage.createUser();
    });

});