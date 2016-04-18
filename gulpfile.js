var gulp = require('gulp'),
        $ = require('gulp-load-plugins')(),
        fs = require('fs'),
        proxy = require('http-proxy-middleware'),
        autoprefixer = require('gulp-autoprefixer');

// Config vars
// If, after a while, there are a lot of config vars, we can move these to a separate file
var environment = {
    test: {
        proxy: 'http://test.openesdh.dk'
    },
    demo: {
        proxy: 'http://178.62.194.129:8080'
    },
    local: {
        repo: 'http://localhost:8080',
        share: 'http://localhost:8081'
    }
};

var paths = {
    scripts: ['app/src/**/*.module.js', 'app/src/**/*.js', '!app/src/**/*Spec.js', '!app/src/modules/test/**/*.js', '!app/src/modules/**/tests/**/*.js'],
    scss: ['app/src/app.scss', 'app/src/**/*.scss'],
    e2e_tests: ['app/tests/e2e/**/*test.js', 'app/src/modules/**/*test.js'],
    protractorConfigFile: 'app/tests/e2e/conf.js'
};

var dist = {
    name: 'opendesk-app',
    folder: './dist/'
};

// Setting up a local webserver
function createWebserver(config) {
    return gulp.src('./')
            .pipe($.webserver({
                open: false, // Open up a browser automatically
                host: '0.0.0.0', // hostname needed if you want to access the server from anywhere on your local network
                middleware: [],
                proxies: [{
                    source: '/alfresco',
                    target: config.repo + '/alfresco'
                }, {
                    source: '/share',
                    target: config.share + '/share'
                }]
            }));
}

// Script tasks
gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
            .pipe($.wrap('(function(){\n"use strict";\n<%= contents %>\n})();'))
            //.pipe($.jshint('.jshintrc'))
            //.pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.concat(dist.name + '.js'))
            .pipe($.change(includeAppConfigParams))
            .pipe(gulp.dest(dist.folder))
            .pipe($.rename({suffix: '.min'}))
            .pipe($.stripDebug())
            .pipe($.ngAnnotate())
            .pipe($.uglify())
            .pipe(gulp.dest(dist.folder))
            .on('error', $.util.log);
});

// CSS
gulp.task('css', function() {
    return gulp.src(paths.scss)
            .pipe($.wrap('/** ---------------- \n * Filepath: <%= file.relative %>\n */\n<%= contents %>'))
            .pipe($.concat(dist.name + '.scss'))
            .pipe($.sass())
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(gulp.dest(dist.folder))
            .pipe($.rename({suffix: '.min'}))
            .pipe($.minifyCss())
            .pipe(gulp.dest(dist.folder))
            .on('error', $.util.log);
});

// UI-test
gulp.task('e2e-tests', function() {
    gulp.src(paths.e2e_tests)
            .pipe($.protractor.protractor({
                configFile: paths.protractorConfigFile
            }))
            .on('error', function(e) {
                throw e;
            });
});

function includeAppConfigParams(content) {
    var argv = require('yargs').argv;
    if (argv.title) {
        content = content.replace("appName: 'OpenDesk'", "appName: '" + argv.title + "'");
    }
    if (argv.logo) {
        content = content.replace("logoSrc: './app/assets/images/logo-light.svg'", "logoSrc: '" + argv.logo + "'");
    }
    return content;
}

// Set up watchers
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.scss, ['css']);
});

/** ----------------
 * Gulp runner tasks
 * (tasks to run from the CLI)
 */

/*
 * This task is used to just build the scripts and CSS.
 * Useful if you want to deploy to production (e.g. with Apache).
 */
gulp.task('build', ['scripts', 'css']);

gulp.task('test', ['build', 'watch'], function() {
    createWebserver(environment.test);
});

gulp.task('demo', ['build', 'watch'], function() {
    createWebserver(environment.demo);
});

gulp.task('local', ['build', 'watch'], function() {
    createWebserver(environment.local);
});

/* Tests */
gulp.task('ui-test', ['e2e-tests']);

/*
 Running '$ gulp'
 is equal to running '$ gulp build watch'
 In other words, the default task is the 'build' and 'watch' task
 */
gulp.task('default', ['build', 'watch']);
