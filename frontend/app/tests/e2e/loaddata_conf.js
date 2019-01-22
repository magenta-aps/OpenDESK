// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

// var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

// https://www.npmjs.com/package/protractor-html-screenshot-reporter

exports.config = {
    capabilities: {'browserName': 'chrome'},
    /*multiCapabilities: [
     {'browserName': 'chrome'},
     {'browserName': 'firefox'},
     {'browserName': 'opera'},
     {'browserName': 'safari'}
     ],*/

    //allScriptsTimeout: 30000,
    rootElement: "body",

    framework: 'jasmine2',
    jasmineNodeOpts: {
        showColors: true,
        isVerbose: true,
        includeStackTrace: true},
    seleniumPort: 4840,

    /* Due to issues with slow Selenium startup due to RNG, see http://stackoverflow.com/questions/14058111/selenium-server-doesnt-bind-to-socket-after-being-killed-with-sigterm. */
    //seleniumArgs: ["-Djava.security.egd=file:/dev/./urandom"],

    onPrepare: function () {
        browser.driver.manage().window().setSize(1440, 800);
        browser.get('http://localhost:8000/#');
        browser.getCapabilities().then(function (capabilities) {
            browser.capabilities = capabilities;
        });

        browser.params.loginDetails = (function () {
            // Load the username/password to use from a config file located
            // in the parent directory of the OpenESDH-UI root
            try {
                return require('../../../../loginDetails.json');
            } catch (e) {
                return { 'admin' : {'username': 'admin', 'password': 'admin'} };
            }
        })();
        // Add a screenshot reporter and store screenshots to `/tmp/screnshots`:
        //see https://github.com/mlison/protractor-jasmine2-screenshot-reporter/issues/4
        /*jasmine.getEnv().addReporter(
            new HtmlScreenshotReporter({
                dest: 'target/screenshots',
                filename: 'failed-reports.html',
                ignoreSkippedSpecs: true,
                reportOnlyFailedSpecs: false,
                captureOnlyFailedSpecs: false,
                pathBuilder: function (currentSpec) {
                    return browser.capabilities.get('platform') + '/' + browser.capabilities.get('browserName') + '.' + browser.capabilities.get('version') + '/' + currentSpec.fullName;
                }
                /!*metadataBuilder: function (currentSpec, suites, browserCapabilities) {
                    return {id: currentSpec.id, os: browserCapabilities.get('browserName')};
                }*!/
            })
        );*/

    },
    suites: {
        loaddata: './loaddata/*.test.js'

    }
};
