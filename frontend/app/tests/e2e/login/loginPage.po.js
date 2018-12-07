// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var globalHeaderMenu = require('../common/globalHeader.po.js');

var LoginPage = function () {

    var public = {};

    /**
     * Default login as admin.
     */
    public.login = function () {
        public.loginAsAdmin();
    };

    public.loginAsAdmin = function () {
        public.loginAsUser('admin');
    };

    public.loginAsUser = function (user) {
        public.loginAs(browser.params.loginDetails[user].username, browser.params.loginDetails[user].password);
    };

    /**
     * Login as an arbitral user
     * @param userName
     * @param password
     */
    public.loginAs = function (userName, password) {
        browser.get('http://localhost:8000/projekter').then(function (response) {
            //The fields
            var userNameInput = element(by.model('vm.credentials.username'));
            var passwordInput = element(by.model('vm.credentials.password'));
            var loginBtn = element(by.css('[ng-click="vm.login(vm.credentials)"]'));

            userNameInput.sendKeys(userName);
            passwordInput.sendKeys(password);
            loginBtn.click();
            browser.driver.sleep(2000);
        });
    };

    return public;
};

module.exports = LoginPage();