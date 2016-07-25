"use strict";

const precss       = require("precss");
const webpack      = require("webpack");
const some         = require("lodash/some");
const autoprefixer = require("autoprefixer");
const pkg          = require("./package.json");

function buildWebpackOptions(shouldMinify)
{
    const testmode = some(process.argv, arg => arg === "--test");
    const options = {
        entry: {
            [shouldMinify ? "index.min" : "index"]: "index.tsx",
        },
        output: {
            path: "dist",
            filename: `[name].js`,
            libraryTarget: "var",
            library: "DeliverOn",
        },
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
            root: process.cwd(),
        },
        externals: {
            "jquery": "$",
            "shopify": "Shopify",
        },
        module: {
            loaders: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                { 
                    test: /\.tsx?$/, 
                    loader: 'awesome-typescript-loader',
                    query: {
                        useBabel: true,
                        useCache: true,
                    } 
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
                TEST_MODE: testmode,
                "process.env" : {
                    "NODE_ENV": testmode ? `"production"` : `"development"`
                }
            })
        ],
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

module.exports = [buildWebpackOptions(true), buildWebpackOptions(false)];