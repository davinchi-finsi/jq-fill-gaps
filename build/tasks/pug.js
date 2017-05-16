const BaseTask = require("./BaseTask.js");
const gulp = require("gulp");
const pug = require("gulp-pug");
const debug = require("gulp-debug");
const path = require("path");
const gulpFilter = require("gulp-filter");
const changed = require("gulp-changed");
const gutil = require("gulp-util");
const config = require("./../config");
class PugTask extends BaseTask {
    _compile(files) {
        this.gutil.log("Compiling pug");
        return gulp.src(this.files)
            .pipe(this.debug())
            .pipe(this.changed(this.gulpConfig.src, {extension: '.html'}))
            .pipe(this.filter(this._filterPartials.bind(this)))
            .pipe(this.debug())
            .pipe(this.pug({
                cache:false,
                pretty: true
            }))
            .pipe(this.gulp.dest(this.gulpConfig.src));
    }

    _filterPartials(file) {
        return path.basename(file.path).indexOf("_") != 0;
    }
}
let pugTask = new PugTask({
    gulpConfig: config,
    taskConfig: {
        files: "**/*.pug"
    },
    gulp: gulp,
    debug: debug,
    changed: changed,
    path: path,
    gutil: gutil,
    pug: pug,
    filter: gulpFilter
});

gulp.task("pug:build", function () {
    return pugTask.build();
});
gulp.task('pug:watch', function () {
    gutil.log("Waiting for pug changes");
    return pugTask.watch();
});

