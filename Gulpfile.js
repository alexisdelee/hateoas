var gulp = require("gulp");
var mocha = require("gulp-mocha");

gulp.task("test", function() {
    return gulp.src(["test/*.js", "test/**/*.js"])
        .pipe(mocha({fullTrace: true}));
});
