'use strict';

const gulp = require('gulp');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const postcssrc = require('postcss-load-config');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const wait = require('gulp-wait');
const linter = { pug: require('gulp-pug-linter') };

gulp.task('build-js', () =>
  gulp
    .src('src/js/**/*.js')
    .pipe(concat('knzkapp.min.js'))
    .pipe(terser())
    .on('error', err => {
      // eslint-disable-next-line no-console
      console.error(err);
    })
    .pipe(gulp.dest('www/'))
);

gulp.task('dev-build-js', () =>
  gulp
    .src('src/js/**/*.js')
    .pipe(
      plumber({
        errorHandler(err) {
          // eslint-disable-next-line no-console
          console.log(err.messageFormatted);
          this.emit('end');
        }
      })
    )
    .pipe(concat('knzkapp.min.js'))
    .pipe(gulp.dest('www/'))
);

gulp.task('build-scss', () => {
  return postcssrc().then(config => {
    return gulp
      .src('src/scss/style.scss')
      .pipe(
        plumber({
          errorHandler(err) {
            // eslint-disable-next-line no-console
            console.log(err.messageFormatted);
            this.emit('end');
          }
        })
      )
      .pipe(wait(100))
      .pipe(sass())
      .pipe(postcss(config.plugins, config.options))
      .pipe(concat('knzkapp.min.css'))
      .pipe(gulp.dest('www/'));
  });
});

gulp.task('build-pug', () =>
  gulp
    .src('src/pug/index.pug')
    .pipe(pug())
    .pipe(concat('index.html'))
    .pipe(gulp.dest('www/'))
);

gulp.task('build', gulp.parallel('build-js', 'build-scss', 'build-pug'));

gulp.task('watch', () => {
  const watcher = gulp.watch('src/scss/**/*.scss', gulp.parallel('build-scss'));
  watcher.on('change', evt => {
    // eslint-disable-next-line no-console
    console.log(`file: ${evt.path}, type: ${evt.type}`);
  });

  const watcherJS = gulp.watch('src/js/**/*.js', gulp.parallel('dev-build-js'));
  watcherJS.on('change', evt => {
    // eslint-disable-next-line no-console
    console.log(`file: ${evt.path}, type: ${evt.type}`);
  });

  const watcherPug = gulp.watch('src/pug/**/*.pug', gulp.parallel('build-pug'));
  watcherPug.on('change', evt => {
    // eslint-disable-next-line no-console
    console.log(`file: ${evt.path}, type: ${evt.type}`);
  });
});

gulp.task('lint-pug', () => gulp.src('src/pug/**/*.pug').pipe(linter.pug()));
