const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-dart-sass');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const del = require('del');
const babel = require("gulp-babel");
const isProd = process.env.NODE_ENV === 'prod';


// let isProd = false;

const htmlFile = [
    'src/*.html',

]

function html() {
    return gulp.src(htmlFile)
        .pipe(htmlPartial({
            basePath: 'src/partials/'
        }))
        .pipe(gulpIf(isProd, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest('docs'));
}
function copyFonts() {
    return gulp.src("src/fonts/*").pipe(gulp.dest("docs/fonts/"));
}
function copyData() {
    return gulp.src("src/data/*").pipe(gulp.dest("docs/data/"));
}
function copyDocuments() {
    return gulp.src("src/documents/*").pipe(gulp.dest("docs/documents/"));
}

function css() {
    return gulp.src('src/sass/style.scss')
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass({
            includePaths: ['node_modules']
        }).on('error', sass.logError))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulpIf(isProd, cssmin()))
        .pipe(gulp.dest('docs/css/'));
}

function js() {
    return gulp.src([
        'node_modules/babel-polyfill/dist/polyfill.js',
        'src/js/*.js'
    ])
        .pipe(jsImport({
            hideConsole: true
        }))
        .pipe(
            babel({
                presets: ['@babel/env']

            })
        )
        .pipe(concat('all.js'))
        .pipe(gulpIf(isProd, terser()))
        .pipe(gulp.dest('docs/js'));
}

function img() {
    return gulp.src('src/img/**/*.*')
        .pipe(gulpIf(isProd, imagemin()))
        .pipe(gulp.dest('docs/img/'));
}

function serve() {
    browserSync.init({
        open: true,
        server: './docs'
    });
}
// function startProdBuild(done) {
//     isProd = true;
//     done();
// }

function browserSyncReload(done) {
    browserSync.reload();
    done();
}


function watchFiles() {
    gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('src/**/*.scss', gulp.series(css, browserSyncReload));
    gulp.watch('src/**/*.js', gulp.series(js, browserSyncReload));
    gulp.watch('src/img/**/*.*', gulp.series(img));
    gulp.watch('src/projects/**/*.html', gulp.series(html, browserSyncReload));
    return;
}

function runClean(done) {
    del.sync("docs");
    done();
}


exports.css = css;
exports.html = html;
exports.js = js;
exports.del = runClean;
exports.serve = gulp.parallel(html, css, js, img, watchFiles, serve);
exports.default = gulp.series(runClean, html, css, js, img, copyFonts, copyData, copyDocuments);
exports.build = gulp.series(runClean, html, css, js, img, copyFonts, copyData, copyDocuments);