"use strict";

const gulp          = require("gulp");
const path          = require("path");
const gulpMerge     = require("merge2");
const webpack       = require("webpack");
const chok          = require("chokidar");
const plumber       = require("gulp-plumber");
const gulpForEach   = require("gulp-foreach");
const seq           = require("gulp-sequence");
const pkg           = require("./package.json");
const webpackStream = require("webpack-stream");
const server        = require("gulp-webserver");
const ts            = require("gulp-typescript");
let cwd           = path.resolve(process.cwd());

function compileTs(gulpSrc)
{
    const project = ts.createProject("./tsconfig.json", { typescript: require('typescript') });

    return gulpSrc
        .pipe(plumber())
        .pipe(ts(project))
        .js
        .pipe(gulp.dest("dist"));
}

function compileWebpack(gulpSrc, shouldWatch)
{
    function webpackOptions(filepath, shouldMinify)
    {
        const options = {
            watch: !!shouldWatch,
            resolve: {
                root: cwd,
            },
            externals: {
                "jquery": "$",
            },
            module: {
                loaders: [
                    {
                        loader: 'babel-loader',
                        test: /\.js$/,
                        exclude: /node_modules/,
                        query: {
                            presets: ['es2015'],
                        },
                    },
                ]
            },
            plugins: [
                new webpack.optimize.OccurenceOrderPlugin,
                new webpack.DefinePlugin({
                    VERSION: JSON.stringify(pkg.version),
                    TEST_MODE: !!shouldWatch
                })
            ],
            output: {
                filename: `${filepath.name}${shouldMinify ? ".min" : ""}.js`,
                libraryTarget: "var",
                library: "DeliverOn",
            }
        };

        if (shouldMinify)
        {
            options.plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                }
            }))
        }

        return options;
    }

    return gulpSrc.pipe(gulpForEach((stream, file) =>
    {
        // Using gulp-foreach to modify webpack options and prevent webpack from renaming all files
        // to its rando hashes.
        const filepath = path.parse(file.path); 
        const options = webpackOptions(filepath, false);
        const minOptions = webpackOptions(filepath, true);

        return stream
            .pipe(plumber())
            .pipe(webpackStream(options))
            .pipe(gulp.dest(filepath.dir))
            .pipe(webpackStream(minOptions))
            .pipe(gulp.dest(filepath.dir));
    }));
}

gulp.task("ts", () =>
{
    return compileTs(gulp.src(["index.ts", "modules/**/*.ts"]));
})

gulp.task("webpack", () =>
{
    return compileWebpack(gulp.src("dist/index.js"));
})

gulp.task("default", seq("ts", "webpack"))

gulp.task("watch", (cb) =>
{
    const watch = chok.watch(["index.ts", "modules/**/*.ts"], {ignoreInitial: false}).on("all", (event, path) =>
    {
         console.log(`${event}: TS file ${path}`);

         return compileTs(gulp.src(path), true);
    })

    gulp.src("./").pipe(server({
        livereload: true,
        directoryListing: {
            enable: true,
            path: "./"   
        },
        port: 3001,
        https: true,
    }));

    compileWebpack(gulp.src("dist/index.js"), true);
})