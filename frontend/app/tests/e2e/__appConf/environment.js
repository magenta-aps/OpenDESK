// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

// Common configuration files with defaults plus overrides from environment vars
var webServerDefaultPort = 8000;

module.exports = {
    // The address of a running selenium server.
    seleniumAddress:
        (process.env.SELENIUM_URL || 'http://localhost:4444/wd/hub'),

    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName':
            (process.env.TEST_BROWSER_NAME || 'chrome'),
        'version':
            (process.env.TEST_BROWSER_VERSION || 'ANY')
    },

    // Default http port to host the web server
    webServerDefaultPort: webServerDefaultPort,

    // Protractor interactive tests
    interactiveTestPort: 6969,

    // A base URL for your application under test.
    baseUrl:
    'http://' + (process.env.HTTP_HOST || 'localhost') +
    ':' + (process.env.HTTP_PORT || webServerDefaultPort)

};