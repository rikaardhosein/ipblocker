var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    babel = require('gulp-babel'),
    Cache = require('gulp-file-cache'),
    exec = require('child_process')
    .exec;

var cache = new Cache();

gulp.task('default', ['compile', 'run']);

gulp.task('compile', function () {
    var stream = gulp.src('./src/**/*.js')
        .pipe(cache.filter())
        .pipe(babel({}))
        .pipe(cache.cache())
        .pipe(gulp.dest('./dist'))
    return stream;
});

gulp.task('watch', ['compile'], function () {
    var stream = nodemon({
        script: 'dist/',
        watch: 'src',
        tasks: ['compile']
    });

    return stream;
});

gulp.task('run', function () {
    exec('node ./dist/index.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });
});

gulp.task('test', function () {
    exec('mocha', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });
});
