const gulp = require('gulp');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const minify = {
  js: composer(uglifyes, console),
  css: require('gulp-clean-css')
};
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
    .pipe(minify.js())
    .on('error', err => {
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
          console.log(err.messageFormatted);
          this.emit('end');
        }
      })
    )
    .pipe(concat('knzkapp.min.js'))
    .pipe(gulp.dest('www/'))
);

gulp.task('build-scss', () =>
  gulp
    .src('src/scss/style.scss')
    .pipe(
      plumber({
        errorHandler(err) {
          console.log(err.messageFormatted);
          this.emit('end');
        }
      })
    )
    .pipe(wait(100))
    .pipe(sass())
    .pipe(minify.css())
    .pipe(concat('knzkapp.min.css'))
    .pipe(gulp.dest('www/'))
);

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
    console.log(`file: ${evt.path}, type: ${evt.type}`);
  });

  const watcherJS = gulp.watch('src/js/**/*.js', gulp.parallel('dev-build-js'));
  watcherJS.on('change', evt => {
    console.log(`file: ${evt.path}, type: ${evt.type}`);
  });

  const watcherPug = gulp.watch('src/pug/**/*.pug', gulp.parallel('build-pug'));
  watcherPug.on('change', evt => {
    console.log(`file: ${evt.path}, type: ${evt.type}`);
  });
});

gulp.task('lint-pug', () => gulp.src('src/pug/**/*.pug').pipe(linter.pug()));
