// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var globalHeader = require('../common/globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');
var oeUtils = require('../common/utils');

describe('openESDH login page', function() {




    describe('openDESK search document', function() {

        it('should be able to search and find an existing document', function() {

            loginPage.loginAsAdmin();

        });
    });


    it('should be able to access login page and login to user dashboard', function() {
        console.log("starting the process of loading testdata");

        browser.get("http://localhost:8000/testdata").then (function(response) {
            console.log("done");
            browser.sleep(7500);
            console.log("finished the process of loading testdata");
        });





    });
});