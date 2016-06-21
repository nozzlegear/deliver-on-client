"use strict";

const gulp = require("gulp");
const path = require("path");
const webpack = require("webpack");
const ts = require("gulp-typescript");
const gulpForEach = require("gulp-foreach");
const webpackStream = require("webpack-stream");
const cwd = path.resolve(process.cwd());

gulp.task("default", () =>
{
    const project = ts.createProject("./tsconfig.json", { typescript: require('typescript') });
    function webpackOptions(filepath, shouldMinify)
    {
        const options = {
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

    return gulp.src("index.ts")
        .pipe(ts(project))
        .js
        .pipe(gulp.dest("dist")) //webpack-stream bug: Files must exist on disk.
        .pipe(gulpForEach((stream, file) =>
        {
            // Using gulp-foreach to modify webpack options and prevent webpack from renaming all files
            // to its rando hashes.
            const filepath = path.parse(file.path); 
            const options = webpackOptions(filepath, false);
            const minOptions = webpackOptions(filepath, true);

            return stream
                .pipe(webpackStream(options))
                .pipe(gulp.dest(filepath.dir))
                .pipe(webpackStream(minOptions))
                .pipe(gulp.dest(filepath.dir));
        }))
})