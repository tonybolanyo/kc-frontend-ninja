var gulp = require("gulp");
var browserSync = require("browser-sync").create();

// for html
var htmlmin = require("gulp-htmlmin");

// for styles
var sass = require("gulp-sass");

// for javascript
var tap = require("gulp-tap");
var browserify = require("browserify");
var buffer = require("gulp-buffer");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");

// default task for development
gulp.task("default", ["html", "js", "sass", "fonts"], function(){
    // launch develop local server
    browserSync.init({
        server: "dist/"
    });

    // watch html files to reload browser
    gulp.watch(["src/*.html", "src/**/*.html"], ["html"]);

    // watch styles folder to compile sass files
    gulp.watch(["src/styles/*.scss", "src/styles/**/*.scss"], ["sass"]);

    // watch font folder
    gulp.watch(["src/fonts/*"], ["fonts"]);
   
});

// compile html files
gulp.task("html", function(){
    gulp.src("src/*.html")
        // minimize html files
        .pipe(htmlmin({collapseWhitespace: true})) 
        // copy to dist folder
        .pipe(gulp.dest("dist"))
        /// and reload browsers
        .pipe(browserSync.stream());
});

// compile css styles from sass files
gulp.task("sass", function(){
    gulp.src("src/styles/*.scss")
        // compile sass
        .pipe(sass().on("error", sass.logError))
        // copy to dist folder
        .pipe(gulp.dest("dist/css/"))
        // and reload browsers
        .pipe(browserSync.stream()); // reload CSS in open browsers
});

// copy fonts
gulp.task("fonts", function(){
    gulp.src("src/fonts/*")
        .pipe(gulp.dest("dist/fonts/"))
        .pipe(browserSync.stream());
})

// compile javascript
gulp.task("js", function(){
    gulp.src("src/js/main.js")
        // to use browserify, we use tap function that
        // allows treat every file, applying same process to each file
        // selected by gulp src command
        .pipe(tap(function(file){
            // replace original content with browserify result
            // first operation is create the browserify instance
            // based on original file
            file.contents = browserify(file.path, {debug: true})
            // transpiling to ES2015
            .transform("babelify", {presets: ["es2015"]})
            // and compile
            .bundle()
            // error catching...
            .on("error", function(error){
                logError(error);
            });
        }))
        // this is necessary because gulp use buffers
        // and not files
        .pipe(buffer())
        // create sourcemaps to use in debugging
        // this translate positions of compiled and
        // uglified files to our source files
        .pipe(sourcemaps.init({loadMaps: true}))
        // minify and uglify javascriot files
        .pipe(uglify())
        // copy to dist folder
        .pipe(gulp.dest("dist/js"))
        // and reload browsers
        .pipe(browserSync.stream())
});