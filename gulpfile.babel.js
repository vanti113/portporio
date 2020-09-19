import gulp from "gulp";
import gPug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import gImage from "gulp-image";
import gulpSass from "gulp-sass";
import autoPre from "gulp-autoprefixer";
import csso from "gulp-csso";

import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

gulpSass.compiler = require("node-sass");

const routes = {
  pug: {
    src: "src/index.pug",
    dest: "build/",
    watch: "src/**/*.pug",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  css: {
    src: "src/scss/style.scss",
    dest: "build/css",
    watch: "src/scss/**/*.scss",
  },
  js: {
    src: "src/js/main.js",
    dest: "build/js",
    watch: "src/js/**/*.js",
  },
};

const clean = () => del(["build/", ".publish/"]);
const webServer = () => {
  return gulp.src("build").pipe(
    ws({
      livereload: true,
      open: true,
    })
  );
};

const pugi = () =>
  gulp.src("src/index.pug").pipe(gPug()).pipe(gulp.dest("build/"));
const pugCss = () =>
  gulp
    .src(routes.css.src)
    .pipe(gulpSass().on("error", gulpSass.logError))
    .pipe(autoPre())
    .pipe(csso())
    .pipe(gulp.dest(routes.css.dest));

const image = () =>
  gulp.src(routes.img.src).pipe(gImage()).pipe(gulp.dest(routes.img.dest));
const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transfrom: [
          babelify.configure({
            presets: ["@babel/preset-env"],
          }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const upload = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, pugi);
  gulp.watch(routes.css.watch, pugCss);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, image, pugCss, js]);
const assets = gulp.series([pugi]);
const live = gulp.series([webServer, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, upload, clean]);
