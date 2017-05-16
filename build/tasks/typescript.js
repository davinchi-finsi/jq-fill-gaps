const gulp = require("gulp");
const ts = require("gulp-typescript");
const path = require("path");
const gutil = require("gulp-util");
const gulpif = require("gulp-if");
const sourcemaps = require('gulp-sourcemaps');
const merge = require("merge2");
const uglify = require("gulp-uglify");
let config = require("./../config");
//client
(function () {
    let tsProject = ts.createProject(path.resolve(config.src, "tsconfig.json"));
    let tsFiles = path.resolve(config.src, "**/*.ts");
    gulp.task("typescript:build", function () {
        let tsresult = gulp.src(tsFiles)
            .pipe(tsProject());

        return merge([
            tsresult.pipe(gulpif(config.sourcemap == true, sourcemaps.init())),
            tsresult.pipe(gulpif(config.sourcemap == true, sourcemaps.write())),
            tsresult.pipe(gulpif(config.production == true, uglify())),
            tsresult.js.pipe(gulp.dest(config.dist))
        ])
    });
    gulp.task('typescript:watch', function () {
        gutil.log("Waiting for ts changes");
        gulp.watch(tsFiles, ['typescript:build']);
    });
})();