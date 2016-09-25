'use strict';

// Require and load our packages
var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    run = require('gulp-run'),
    istanbul = require('gulp-istanbul'),
    jslint = require('gulp-jslint'),
    yuidoc = require('gulp-yuidoc'),
    jshint = require('gulp-jshint');

// Reference our app files for easy reference in out gulp tasks
var paths = {
    server : {
        specs : ['./test/lib/*.js'],
        libs_specs_path : ['./test/lib/']
    }
};


// The `default` task gets called when no task name is provided to Gulp
gulp.task('default', ['jslint', 'tests', 'docs'], function (cb) {
    cb().pipe(process.exit());
});

gulp.task('tests', function (cb) {
    gulp.src('lib/*.js')

        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files

        .on('finish', function () {
            gulp.src([paths.server.libs_specs_path + '*.js'])
                .pipe(mocha({reporter: 'spec', timeout: 5000}))
                .pipe(istanbul.writeReports()) // Creating the reports after tests run
                .on('end', function () {
                    cb().pipe(process.exit());
                });
        });
});
gulp.task('lint', function() {
    return gulp.src(['lib/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('jslint', function (cb) {
    gulp.src(['lib/*.js'])

        .pipe(jslint({
            // these directives can
            // be found in the official
            // JSLint documentation.
            node: true,
            nomen: true,
            plusplus: true,
            // you can also set global
            // declarations for all source
            // files like so:
            global: [],
            predef: [],
            // both ways will achieve the
            // same result; predef will be
            // given priority because it is
            // promoted by JSLint

            // pass in your prefered
            // reporter like so:
            reporter: 'default',
            // ^ there's no need to tell gulp-jslint
            // to use the default reporter. If there is
            // no reporter specified, gulp-jslint will use
            // its own.

            // specifiy custom jslint edition
            // by default, the latest edition will
            // be used
            edition: '2014-07-08',

            // specify whether or not
            // to show 'PASS' messages
            // for built-in reporter
            errorsOnly: false
        }))

        .on('finish', function () {
            cb().pipe(process.exit());
        });
});