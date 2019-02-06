// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var globalHeader = require('./globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');

describe('openESDH header', function() {

    //Executed before each of the "it" tests
    beforeEach(function() {
        loginPage.login();
    });

    it('should display all widgets in the global header', function() {
        expect(globalHeader.getHeaderMenuItem().dashboardBtn);
        expect(globalHeader.getHeaderMenuItem().casesBtn);
        expect(globalHeader.getHeaderMenuItem().tasksBtn);
        expect(globalHeader.getHeaderMenuItem().searchBoxInput);
        expect(globalHeader.getHeaderMenuItem().userMenuBtn);

    });

    afterEach(function() {
        loginPage.logout();
        //wait for 2 secs just in case
    });

});