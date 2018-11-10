const gulp = require('gulp'),
  uglifyes = require('uglify-es'),
  composer = require('gulp-uglify/composer'),
  minify = { js: composer(uglifyes, console), css: require('gulp-clean-css') },
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  pug = require('gulp-pug'),
  plumber = require('gulp-plumber'),
  wait = require('gulp-wait'),
  linter = { pug: require('gulp-pug-linter') }

gulp.task('build-js', () =>
  gulp
    .src('src/js/**/*.js')
    .pipe(concat('knzkapp.min.js'))
    .pipe(minify.js())
    .on('error', err => {
      console.error(err)
    })
    .pipe(gulp.dest('www/'))
)

gulp.task('dev-build-js', () =>
  gulp
    .src('src/js/**/*.js')
    .pipe(
      plumber({
        errorHandler(err) {
          console.log(err.messageFormatted)
          this.emit('end')
        }
      })
    )
    .pipe(concat('knzkapp.min.js'))
    .pipe(gulp.dest('www/'))
)

gulp.task('build-scss', () =>
  gulp
    .src('src/scss/style.scss')
    .pipe(
      plumber({
        errorHandler(err) {
          console.log(err.messageFormatted)
          this.emit('end')
        }
      })
    )
    .pipe(wait(100)) // watchの際に保存と同時に走らされるとコケる場合があるので入れる
    .pipe(sass())
    .pipe(minify.css())
    .pipe(concat('knzkapp.min.css'))
    .pipe(gulp.dest('www/'))
)

gulp.task('build-pug-mastodon', function() {
  return gulp
    .src('src/pug/index.pug')
    .pipe(pug())
    .pipe(concat('index.html'))
    .pipe(gulp.dest('www/'))
})

gulp.task('build-pug-misskey', function() {
  return gulp
    .src('src/pug/misskey.pug')
    .pipe(pug())
    .pipe(concat('misskey.html'))
    .pipe(gulp.dest('www/'))
})

gulp.task('build-pug', ['build-pug-mastodon', 'build-pug-misskey'])

gulp.task('build', ['build-js', 'build-scss', 'build-pug'])

gulp.task('watch', function() {
  var watcher = gulp.watch('src/scss/**/*.scss', ['build-scss'])
  watcher.on('change', function(evt) {
    console.log('file: ' + evt.path + ', ' + 'type: ' + evt.type)
  })

  const watcherJS = gulp.watch('src/js/**/*.js', ['dev-build-js'])
  watcherJS.on('change', evt => {
    console.log(`file: ${evt.path}, type: ${evt.type}`)
  })

  const watcherPug = gulp.watch('src/pug/**/*.pug', ['build-pug'])
  watcherPug.on('change', evt => {
    console.log(`file: ${evt.path}, type: ${evt.type}`)
  })
})

gulp.task('lint-pug', () => gulp.src('src/pug/**/*.pug').pipe(linter.pug()))
