'use strict';
const gulp = require('gulp');
gulp.task('server', function () {
    const config = require("./../config");
    const bs = require("lite-server");
    if (config.server) {
        for (let key in config.server) {
            bs.defaults[key] = config.server[key];
        }
    }
    bs.server();
});
