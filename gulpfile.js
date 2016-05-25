'use strict';

//npm install gulp gulp-minify-css gulp-uglify gulp-clean gulp-cleanhtml gulp-jshint gulp-strip-debug gulp-zip --save-dev

var gulp = require('gulp'),
    clean = require('gulp-clean'),
    cleanhtml = require('gulp-cleanhtml'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip');
var wrap = require("gulp-wrap"),
    concat = require("gulp-concat"),
    prettify = require('gulp-jsbeautifier');

//clean build directory
gulp.task('clean', function() {
    return gulp.src('build/*', {read: false})
        .pipe(clean());
});

//wrap code with require
gulp.task("standalone",function(){
    return gulp.src(["./content_scripts/util.js","./content_scripts/board.js","./content_scripts/trigger.js" ])
        .pipe(concat("boardWithRequire.js"))
        .pipe(wrap('(function(){\n"use strict";\nrequire(["jquery"],function($) {\n<%= contents %>\n});\n})();'))
        .pipe(prettify({indentSize: 4}))
        .pipe(gulp.dest("./standalone/"));

});

//copy static folders to build directory
gulp.task('copy', function() {
    gulp.src("lib/*.js")
        .pipe(gulp.dest("build/lib"));
    return gulp.src('manifest.json')
        .pipe(gulp.dest('build'));
});


//run scripts through JSHint
gulp.task('jshint', function() {
    return gulp.src('content_scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('scripts', ['jshint'], function() {
    gulp.src('src/scripts/vendors/**/*.js')
        .pipe(gulp.dest('build/scripts/vendors'));
    return gulp.src(['content_scripts/*.js'])
        .pipe(stripdebug())
        .pipe(uglify({outSourceMap: true}))
        .pipe(gulp.dest('build/content_scripts'));
});


//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['scripts', 'copy', 'standalone'], function() {
    var manifest = require('./manifest'),
        distFileName = manifest.name + ' v' + manifest.version + '.zip';
    //build distributable extension
    return gulp.src('build/**')
        .pipe(zip(distFileName))
        .pipe(gulp.dest('dist'));
});

//run all tasks after build directory has been cleaned
gulp.task('default', ['clean'], function() {
    gulp.start('zip');
});