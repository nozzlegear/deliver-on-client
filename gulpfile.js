"use strict";

const gulp          = require("gulp");
const path          = require("path");
const precss        = require('precss');
const gulpMerge     = require("merge2");
const webpack       = require("webpack");
const chok          = require("chokidar");
const autoprefixer  = require('autoprefixer');
const plumber       = require("gulp-plumber");
const pkg           = require("./package.json");
const server        = require("gulp-webserver");
const webpackStream = require("webpack-stream");
let cwd             = path.resolve(process.cwd());

function buildWebpackOptions(shouldMinify, shouldWatch)
{
    const options = {
        watch: !!shouldWatch,
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
            root: cwd,
        },
        externals: {
            "jquery": "$",
        },
        module: {
            loaders: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                { 
                    test: /\.tsx?$/, 
                    loader: 'awesome-typescript-loader' 
                },
                {
                    loader: 'babel-loader',
                    test: /\.js$/,
                    exclude: /node_modules/,
                    query: {
                        presets: ['es2015'],
                    },
                },
                {
                    test: /\.css$/,
                    loaders: ["style", "css", "postcss"]
                },
                {
                    test: /\.scss$/,
                    loaders: ["style", "css", "postcss", "sass"]
                }
            ],
            preLoaders: [
                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { test: /\.js$/, loader: "source-map-loader" }
            ]
        },
        postcss: () => [precss, autoprefixer],
        // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",
        plugins: [
            new webpack.optimize.OccurenceOrderPlugin,
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(pkg.version),
                TEST_MODE: !!shouldWatch,
                "process.env" : {
                    "NODE_ENV": shouldMinify ? `"production"` : `"development"`
                }
            })
        ],
        output: {
            filename: `index${shouldMinify ? ".min" : ""}.js`,
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

function compileWebpack(gulpSrc, options)
{
    return gulpSrc
        .pipe(plumber())
        .pipe(webpackStream(options))
        .pipe(gulp.dest("dist"))
}

gulp.task("webpack", () =>
{
    const config = buildWebpackOptions(false, false);
    const minConfig = buildWebpackOptions(true, false);

    return gulpMerge(compileWebpack(gulp.src("index.ts"), config), compileWebpack(gulp.src("index.ts"), minConfig));
})

gulp.task("default", ["webpack"])

gulp.task("watch", (cb) =>
{
    gulp.src("./").pipe(server({
        livereload: true,
        directoryListing: {
            enable: true,
            path: "./"   
        },
        port: 3001,
        https: true,
    }));

    compileWebpack(gulp.src("index.tsx"), buildWebpackOptions(false, true));
    compileWebpack(gulp.src("index.tsx"), buildWebpackOptions(true, true));
})