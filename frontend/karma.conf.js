'use strict'

module.exports = function (config) {
  config.set({

    basePath: './',

    files: [
      'app/node_modules/angular/angular.js',
      'app/node_modules/angular-route/angular-route.js',
      'app/node_modules/angular-aria/angular-aria.js',
      'app/node_modules/angular-mocks/angular-mocks.js',
      'app/node_modules/angular-material/angular-material.js',
      'app/src/**/*.js'
    ],

    autoWatch: false,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    singleRun: true,

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  })
}
