let project_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
        svg: project_folder + "/img/svg/",
        library: project_folder + "/library/",
    },

    src: {
        html: [source_folder + "/*.{html,pug}", "!" + source_folder + "/_*.{html,pug}"],
        css: source_folder + "/scss/*.{scss,css}",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.{woff2,woff,ttf}",
        svg: source_folder + "/img/svg/*.svg",
        library: source_folder + "/library/**/*.*",
    },
    watch: {
        html: source_folder + "/**/*.{html,pug}",
        css: source_folder + "/scss/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
        svg: source_folder + "/img/svg/*.svg",
        library: source_folder + "/library/**/*.*",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require("gulp"),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    pug = require("gulp-pug"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    svgsprite = require("gulp-svg-sprite"),
    plumber = require("gulp-plumber"),
    woff = require("gulp-ttf2woff"),
    woff2 = require("gulp-ttf2woff2");

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false,
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(pug())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)

        .pipe(scss({
            outputStyle: "expanded"
        }))
        .pipe(plumber())
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            // cascade: true
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
        .pipe(clean_css())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3, // 0 to 7
            })
        )
        .pipe(webp({ quality: 70 }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}
function svg() {
    return src(path.src.svg)
        .pipe(
            svgsprite({
                mode: { stack: { sprite: "../sprite.svg" } }
            })
        )
        .pipe(dest(path.build.svg))
        .pipe(browsersync.stream())
}
function fonts() {
    src(path.src.fonts)
        .pipe(woff2())
        .pipe(dest(path.build.fonts))
}
function library() {
    return src(path.src.library)
        .pipe(dest(path.build.library))
        .pipe(browsersync.stream())
}
function watchFiles(params) {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], images)
    gulp.watch([path.watch.svg], svg)
    gulp.watch([path.watch.library], library)
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, svg, fonts, library));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.library = library;
exports.fonts = fonts;
exports.svg = svg;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
