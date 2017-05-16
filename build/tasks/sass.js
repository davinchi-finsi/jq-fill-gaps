'use strict';
const BaseTask = require("./BaseTask.js");
const gulp = require('gulp');
const gutil = require("gulp-util");
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const debug = require("gulp-debug");
const path = require("path");
const config = require("./../config");
const gulpAutoprefixer = require("gulp-autoprefixer");
class SassTask extends BaseTask {
    _compile(files) {
        this.gutil.log("Compiling sass");
        return gulp.src(files)
                   .pipe(debug())
                   .pipe(this.gulpConfig.sourcemap ? this.sourcemaps.init() : this.gutil.noop())
                   .pipe(this.sass({
                       outputStyle: this.gulpConfig.production == true ? "compressed" : "expanded",
                       errLogToConsole: true
                   }).on('error', this.sass.logError))
                   .pipe(this.gulpAutoprefixer(this.taskConfig.autoprefixerOptions))
                   .pipe(this.gulpConfig.sourcemap ? this.sourcemaps.write() : this.gutil.noop())
                   .pipe(this.gulp.dest(this.gulpConfig.dist));
    }
}
let sassTask = new SassTask({
    gulpConfig: config,
    taskConfig: {
        files: ["**/*.scss"],
        exclude: config.sass
            ? config.sass.exclude
            : null,
        compileAllOnChange: true
    },
    autoprefixerOptions:{
        browsers: ['last 5 version',"ie 10","ie 11"]
    },
    gulp: gulp,
    debug: debug,
    path: path,
    gutil: gutil,
    sass: sass,
    sourcemaps: sourcemaps,
    gulpAutoprefixer:gulpAutoprefixer
});
gulp.task('sass:build', function () {
    sassTask.build();
});

gulp.task('sass:watch', function () {
    gutil.log("Waiting for sass changes");
    sassTask.watch();
});
