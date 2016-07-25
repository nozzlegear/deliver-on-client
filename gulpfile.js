"use strict";

const gulp          = require("gulp");
const server        = require("gulp-webserver");

gulp.task("watch", (cb) =>
{
    gulp.src("./").pipe(server({
        livereload: true,
        directoryListing: {
            enable: true,
            path: "./"   
        },
        port: 3001,
        https: true,
    }));
})