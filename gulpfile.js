const gulp = require('gulp'),
  minify = {
    'js': require('gulp-uglify'),
    'css': require('gulp-clean-css')
  },
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  pug = require('gulp-pug'),
  plumber = require('gulp-plumber'),
  wait = require('gulp-wait');

gulp.task('build-js', function () {
  return gulp.src('src/js/**/*.js')
    .pipe(minify.js())
    .on('error', function (err) { console.error(err); })
    .pipe(concat('knzkapp.min.js'))
    .pipe(gulp.dest('www/'));
});

gulp.task('dev-build-js', function () {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.messageFormatted);
        this.emit('end');
      }
    }))
    .pipe(concat('knzkapp.min.js'))
    .pipe(gulp.dest('www/'));
});

gulp.task('build-scss', function () {
  return gulp.src('src/scss/style.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.messageFormatted);
        this.emit('end');
      }
    }))
    .pipe(wait(100)) // watchの際に保存と同時に走らされるとコケる場合があるので入れる
    .pipe(sass())
    .pipe(minify.css())
    .pipe(concat('knzkapp.min.css'))
    .pipe(gulp.dest('www/'));
});

gulp.task('build', ['build-js', 'build-scss']);

gulp.task('watch', function () {
  var watcher = gulp.watch('scss/*.scss', ['build-scss']);
  watcher.on('change', function (evt) {
    console.log('file: ' + evt.path + ', ' + 'type: ' + evt.type);
  });

  var watcherJS = gulp.watch('js/**/*.js', ['dev-build-js']);
  watcherJS.on('change', function (evt) {
    console.log('file: ' + evt.path + ', ' + 'type: ' + evt.type);
  });
});
