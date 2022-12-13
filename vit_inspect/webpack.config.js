const path = require('path');

module.exports = {
    mode: 'development',
    // DXF editor only uses js on the front-end:
    target: "web",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".js",".jsx",".ts", ".tsx"],
        fallback: {
            fs: false,
            path: false,
            crypto: false
        }
    },
    watch: false,
    entry: {
        main: './src/index.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/static/js',
        //globalObject: 'this',
        library: {
            type: "module",
            //export: "default"
        },
    },
    experiments: {
        outputModule: true
    }
}