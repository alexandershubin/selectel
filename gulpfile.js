"use strict";

const gulp = require("gulp");
const del = require("del");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
sass.compiler = require('node-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const babel = require('gulp-babel');
let uglify = require('gulp-uglify-es').default;
const htmlmin = require("gulp-htmlmin");
const server = require("browser-sync").create();


gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
  .pipe(plumber())
  .pipe(sass({includePaths: require('node-normalize-scss').includePaths}))
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(gulp.dest("build/css"))
  .pipe(csso())
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("build/css"))
  .pipe(server.stream());
});

gulp.task('default', () =>
  gulp.src('source/js/*.js')
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(gulp.dest('build/js'))
);

gulp.task("js", function() {
  return gulp.src(["source/js/*.js"
  ])
  .pipe(gulp.dest("build/js"))
  .pipe(uglify())
  .pipe(rename("app.min.js"))
  .pipe(gulp.dest("build/js"));
});

gulp.task("html", function() {
  return gulp.src(["source/*.html"
  ])
  .pipe(gulp.dest("build/html"))
  .pipe(htmlmin())
  .pipe(gulp.dest("build/html"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
  .pipe(svgstore({
    inlineSvg: true}))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});


gulp.task("html", function() {
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"))
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/**/*.{png,jpg}")
  .pipe(webp({quality:90}))
  .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.html",
    "source/*.php"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("server", function () {
  server.init({
    server: "build/"
  });

  gulp.watch("source/js/*.js", gulp.series("js"));
  gulp.watch("source/img/**/*.{png,jpg,svg}", gulp.series("images"));
  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html"));
  gulp.watch("source/*.html", gulp.series("html", "refresh")).on("change", server.reload);
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "js",
  "css",
  "sprite",
  "html",
  "images"));

gulp.task(
  "start",
  gulp.series(
    "build",
    "server"
  ));


