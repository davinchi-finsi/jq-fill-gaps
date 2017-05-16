const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const config = require('./../config');
gulp.task('imagemin', () =>
    gulp.src(config.imagemin.src)
        .pipe(imagemin(config.imagemin.options || {}))
        .pipe(gulp.dest(config.dist))
);