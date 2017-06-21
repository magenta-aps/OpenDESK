//var HtmlScreenshotReporter = require("protractor-jasmine2-screenshot-reporter");
//var JasmineReporters = require('jasmine-reporters');

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


        //console.log("It's located in " + __dirname);

    // The require statement must be down here, since jasmine-reporters
            // needs jasmine to be in the global and protractor does not guarantee
            // this until inside the onPrepare function.
        // The require statement must be down here, since jasmine-reporters
        // needs jasmine to be in the global and protractor does not guarantee
        // this until inside the onPrepare function.
        //new jasmine.JUnitXmlReporter('xmloutput', true, true)

        //jasmine.getEnv().addReporter(new JasmineReporters.JUnitXmlReporter(
        //   'xmloutput, true, true'
        //));
        //jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
        //    dest: "build/reports/e2e/screenshots"
        //}));

        browser.get('http://localhost:8000');
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
        login: './login/login.test.js',
        //projects: './projects/*.test.js',
        //grouprooms: './groupRooms/*.test.js',
        //folders: './folders/*.test.js',
        //projectlinks: './projectlinks/*.test.js',
        documents: './documents/*.test.js',
        //members: './members/*.test.js'
        //logout: './login/logout.test.js',
    }
};
