({
    appDir: "../",
    baseUrl: "./",
    dir: "../../webapp-build",
    //Comment out the optimize line if you want
    //the code minified by UglifyJS
    optimize: "none",

    paths: {
        "jquery": "empty:",
        "tpl": "vendor/tpl",
        "i18n": "vendor/i18n"
    },

    modules: [{
        //Optimize the application files. jQuery is not included since it is already in require-jquery.js
        name: "main"
    }]
})