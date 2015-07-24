var gulp = require('gulp'),
  livereload = require('gulp-livereload'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  minifyHTML = require('gulp-minify-html'),
  less = require('gulp-less'),
  minifyCSS = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename");

gulp.task('express', function() {
  require('./app');
});

gulp.task('browserify', function() {
  return browserify({
      entries: ['src/index.jsx'],
      debug: true,
      insertGlobals: true,
      cache: {},
      packageCache: {},
      fullPaths: true,
      transform: ['reactify']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/'))
    .pipe(livereload());
});

gulp.task('minify-html', function() {
  var opts = {
    conditionals: true,
    spare: true
  };

  return gulp.src('./src/*.html')
    .pipe(minifyHTML({
      conditionals: true,
      spare: true
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(livereload());
});

gulp.task('semantic-conf', function() {
  return gulp.src(['./bower_components/semantic-ui/src/theme.config.example'])
    .pipe(rename('theme.config'))
    .pipe(gulp.dest('./bower_components/semantic-ui/src/'));
});

gulp.task('less', ['semantic-conf'], function() {
  return gulp.src('./src/index.less')
    //plumber
    .pipe(less({
      // paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public'))
    .pipe(livereload());
});

gulp.task('images', function() {
  return gulp.src(['./src/*.jpg', './src/*.png'], {
      base: './src'
    })
    .pipe(gulp.dest('./public'));
});

gulp.task('js-libs', function() {
  return gulp.src([
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/semantic-ui/dist/semantic.min.js'
    ])
    .pipe(concat('dependencies.js', {
      newLine: ';\n'
    }))
    // .pipe(uglify({
    //   mangle: false,
    //   compress: false
    // }))
    .pipe(gulp.dest('public'));
});


gulp.task('default', ['images', 'browserify', 'less', 'js-libs', 'minify-html']);

gulp.task('run', ['express', 'default'], function() {
  livereload.listen();
  gulp.watch('src/*.js*', ['browserify']);
  gulp.watch('src/*.less', ['less']);
  gulp.watch('src/*.html', ['minify-html']);
});
