'use strict';

const config = require('./../config');
const gulp = require('gulp');
const clean = require("gulp-clean");
gulp.task('copy', function () {
    return gulp.src(config.copy,{ "base" : "./src" })
        .pipe(gulp.dest(config.dist))
});
